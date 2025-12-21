import type { NodeExecuter } from "@/feature/core/execution/domain/types/executor-types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import handlebars from "handlebars";
import { geminiChannel } from "@/bootstrap/integrations/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import getCredentialUseCase from "@/feature/core/credential/domain/usecase/get-credential.usecase";
import { decrypt } from "@/bootstrap/helpers/encryption/encryption";
import { isLeft } from "fp-ts/lib/Either";

handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new handlebars.SafeString(jsonString);
    return safeString;
});

type GeminiData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};

export const geminiExecuter: NodeExecuter<GeminiData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {

    await publish(
        geminiChannel().status(
            {
                nodeId,
                status: "loading",
            })
    );

    if (!data.variableName || !data.userPrompt || !data.credentialId) {
        await publish(
            geminiChannel().status(
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
          geminiChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("credential not found");
      }

      return result.right;
    });

    const google = createGoogleGenerativeAI({
        apiKey: decrypt(credentialResult.value),
    });

    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google(data.model || "gemini-2.5-flash"),
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
            geminiChannel().status(
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
            geminiChannel().status(
                {
                    nodeId,
                    status: "error",
                })
        );
        throw error;
    }

}
