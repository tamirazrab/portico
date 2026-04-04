import handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { validateOutboundUrl } from "@/bootstrap/helpers/security/ssrf";
import { httpRequestChannel } from "@/bootstrap/integrations/inngest/channels/http-request";
import type { NodeExecuter } from "@/feature/core/execution/infrastructure/executor/types/executor-types";
import { KyHttpClient } from "../../adapters/ky-http-client";
import type { HttpMethod } from "../../ports/http-client.port";

handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new handlebars.SafeString(jsonString);
  return safeString;
});

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: HttpMethod;
  body?: string;
};

const httpClient = new KyHttpClient();

export const HttpRequestExecuter: NodeExecuter<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    const result = await step.run("http-request", async () => {
      if (!data.endpoint) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("HTTP REQUEST:endpoint is required");
      }
      if (!data.variableName) {
        throw new NonRetriableError("HTTP REQUEST:Variable name is required");
      }
      if (!data.method) {
        throw new NonRetriableError("HTTP REQUEST:Method is required");
      }

      const method = data.method || "GET";
      const renderedEndpoint = handlebars.compile(data.endpoint)(context);
      const validated = await validateOutboundUrl(renderedEndpoint);
      if (!validated.ok) {
        throw new NonRetriableError(
          `HTTP REQUEST:Invalid endpoint (${validated.reason})`,
        );
      }
      const endpoint = validated.url.toString();

      const headers: Record<string, string> = {};
      let body: string | undefined;

      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resolved = handlebars.compile(data.body || "{}")(context);
        JSON.parse(resolved);
        body = resolved;
        headers["Content-Type"] = "application/json";
      }

      const response = await httpClient.request({
        url: endpoint,
        method,
        ...(Object.keys(headers).length ? { headers } : {}),
        ...(body !== undefined ? { body } : {}),
      });

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
