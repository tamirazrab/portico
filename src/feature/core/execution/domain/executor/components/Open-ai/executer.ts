import type { NodeExecuter } from "@/feature/core/execution/domain/types/executor-types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import handlebars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai";
import { openaiChannel } from "@/bootstrap/integrations/inngest/channels/openai";
import getCredentialUseCase from "@/feature/core/credential/domain/usecase/get-credential.usecase";
import { decrypt } from "@/bootstrap/helpers/encryption/encryption";
import { isLeft } from "fp-ts/lib/Either";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type OpenaiData = {
    credentialId?: string;
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const openaiExecuter: NodeExecuter<OpenaiData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {

    await publish(
        openaiChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.userPrompt || !data.credentialId) {
        await publish(
            openaiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw new NonRetriableError("variableName, userPrompt and credentialId are required");
    }

    const systemPrompt = data.systemPrompt
        ? handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful asistant.";


    const userPrompt = handlebars.compile(data.userPrompt || "")(context);


    // Get credential using usecase
    const credentialResult = await step.run("get-credential", async () => {
      const result = await getCredentialUseCase({
        id: data.credentialId!,
        userId,
      })();

      if (isLeft(result)) {
        await publish(
          openaiChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("credential not found");
      }

      return result.right;
    });

    const openai = createOpenAI({
        apiKey: decrypt(credentialResult.value),
    });

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai(data.model || "gpt-4.1-mini"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                },
            },
        )

        const text = steps[0].content[0].type === "text"
            ? steps[0].content[0].text
            : "";

        await publish(
            openaiChannel().status(
                {
                    nodeId,
                    status: "success",
                })
        );

        return {
            ...context,
            [data.variableName]: {
                aiResponse: text,
            },
        }

    } catch (error) {
        await publish(
            openaiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
