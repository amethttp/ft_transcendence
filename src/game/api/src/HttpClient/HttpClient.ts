import type { IHttpClient, TGetParamValue } from "./IHttpClient";
import https from 'https';
import fetch from 'node-fetch';

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

  private _bodyRequest<BodyType, ResponseType>(url: string, body: BodyType, options: RequestInit = {}): Promise<ResponseType> {
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

  protected async request<AuthWrapper>(url: string, options: RequestInit = {}): Promise<AuthWrapper> {
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    };

    if (requestOptions.body && typeof requestOptions.body !== "string" && !(requestOptions.body instanceof FormData) && !(requestOptions.body instanceof Blob)) {
      requestOptions.headers = {
        'Content-Type': 'application/json',
        ...(requestOptions.headers || {}),
      };
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
    try {
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
      const response = await fetch(url, {
        ...(requestOptions as fetch.RequestInit),
        agent: httpsAgent
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
      }

      return response.json().catch(err => { throw err });
    }
    catch (err: any) {
      console.log(err);
      if (!Object.keys(err).includes("status"))
        console.error('Network error');

      throw err;
    }
  }
}
