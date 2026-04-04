export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type HttpResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
};

export type HttpRequest = {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
};

export interface HttpClientPort {
  request(req: HttpRequest): Promise<HttpResponse>;
}
