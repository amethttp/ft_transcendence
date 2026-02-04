import type { BasicResponse } from "../auth/models/BasicResponse";
import { Context } from "../framework/Context/Context";
import { CookieHelper } from "../framework/CookieHelper/CookieHelper";
import HttpClient from "../framework/HttpClient/HttpClient";
import type { TGetParamValue } from "../framework/HttpClient/IHttpClient";
import { ErrorMsg, type ResponseError } from "./models/ResponseError";

export class ApiClient extends HttpClient {
  static readonly BASE_URL = import.meta.env.VITE_API_URL;
  private _redirect: boolean;

  constructor(redirect: boolean = true) {
    super();
    this._redirect = redirect;
  }

  async get<ResponseType>(path: string, params?: Record<string, TGetParamValue>, options?: RequestInit): Promise<ResponseType> {
    return super.get(ApiClient.BASE_URL + path, params, options);
  }

  async post<BodyType, ResponseType>(path: string, body?: BodyType, options?: RequestInit): Promise<ResponseType> {
    return super.post<BodyType, ResponseType>(ApiClient.BASE_URL + path, body, options);
  }

  async delete<BodyType, ResponseType>(path: string, body?: BodyType, options?: RequestInit): Promise<ResponseType> {
    return super.delete<BodyType, ResponseType>(ApiClient.BASE_URL + path, body, options);
  }

  async patch<BodyType, ResponseType>(path: string, body?: BodyType, options?: RequestInit): Promise<ResponseType> {
    return super.patch<BodyType, ResponseType>(ApiClient.BASE_URL + path, body, options);
  }

  async put<BodyType, ResponseType>(path: string, body?: BodyType, options?: RequestInit): Promise<ResponseType> {
    return super.put<BodyType, ResponseType>(ApiClient.BASE_URL + path, body, options);
  }

  private refreshToken(): Promise<BasicResponse> {
    return this.get("/auth/refresh", undefined, { credentials: "include" });
  }

  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = CookieHelper.get("AccessToken");
    options.headers = {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...options.headers,
    };

    try {
      return await super.request<T>(url, options);
    } catch (_error: any) {
      if (_error.name === 'AbortError') {
        throw _error;
      }
      const error: ResponseError = _error;
      if (error.error === ErrorMsg.AUTH_EXPIRED_ACCESS) {
        try {
          const res = await this.refreshToken();
          if (res.success)
            return this.request<T>(url, options);
        } catch (error) {
          if (this._redirect)
            Context.router.navigateByPath("/");
        }
      }
      throw error;
    }
  }
}