import ky, { type Options as KyOptions } from "ky";
import type {
  HttpClientPort,
  HttpRequest,
  HttpResponse,
} from "../ports/http-client.port";

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

export class KyHttpClient implements HttpClientPort {
  async request(req: HttpRequest): Promise<HttpResponse> {
    const options: KyOptions = {
      method: req.method,
      headers: req.headers,
      ...(req.body !== undefined ? { body: req.body } : {}),
    };

    const res = await ky(req.url, options);
    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    return {
      status: res.status,
      statusText: res.statusText,
      headers: headersToRecord(res.headers),
      data,
    };
  }
}
