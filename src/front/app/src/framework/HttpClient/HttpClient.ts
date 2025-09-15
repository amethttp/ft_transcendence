import type { IHttpClient, TGetParamValue } from "./IHttpClient";


export default class HttpClient implements IHttpClient {


  constructor() { }

  async get<ResponseType>(url: string, params?: Record<string, TGetParamValue>, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'get';
    const _url = new URL(url);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        _url.searchParams.append(key, String(value));
      }
    }
    return this.request<ResponseType>(_url.href, options);
  }

  private _bodyRequest<BodyType, ResponseType>(url: string, body?: BodyType, options: RequestInit = {}): Promise<ResponseType> {
    options.body = body as BodyInit;
    return this.request<ResponseType>(url, options)
  }

  async post<BodyType, ResponseType>(url: string, body?: BodyType, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'post';
    return this._bodyRequest(url, body, options);
  }

  async delete<BodyType, ResponseType>(url: string, body?: BodyType, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'delete';
    return this._bodyRequest(url, body, options);
  }

  async patch<BodyType, ResponseType>(url: string, body?: BodyType, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'patch';
    return this._bodyRequest(url, body, options);
  }

  async put<BodyType, ResponseType>(url: string, body?: BodyType, options: RequestInit = {}): Promise<ResponseType> {
    options.method = 'put';
    return this._bodyRequest(url, body, options);
  }

  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    if (!(options.body instanceof FormData) && !(options.body instanceof Blob)) {
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      options.body = JSON.stringify(options.body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { status: response.status, ...errorData };
    }

    return response.json().catch(err => { throw err });
  }
}