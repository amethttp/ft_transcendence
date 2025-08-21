import type { IHttpClient, TGetParamValue } from "./IHttpClient";


export default class HttpClient implements IHttpClient {


  constructor() { }

  async get<ResponseType>(url: string, params?: Record<string, TGetParamValue>, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'get';
    const _url = new URL(url);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        _url.searchParams.append(key, value as string);
      }
    }
    return this.request<ResponseType>(_url.href, options);
  }

  async post<BodyType, ResponseType>(url: string, body?: BodyType, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'post';
    options.body = JSON.stringify(body);
    return this.request<ResponseType>(url, options);
  }

  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { status: response.status, ...errorData };
    }

    return response.json().catch(err => { throw err });
  }
}