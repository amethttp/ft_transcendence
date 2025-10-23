import { CookieHelper } from "../../CookieHelper/CookieHelper";
import HttpClient from "../HttpClient";
import type { TGetParamValue } from "../IHttpClient";
import { ErrorMsg, ResponseError } from "./models/ResponseError";
import { AuthWrapper } from "./wrappers/AuthWrapper";

export class ApiClient extends HttpClient {
  static readonly BASE_URL = "https://platform";

  constructor() {
    super();
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

  private refreshToken(headers?: Record<string, any>): Promise<string> {
    return this.get("/auth/access/refresh", undefined, headers);
  }

  protected async request<AuthWrapper>(url: string, options: RequestInit = {}): Promise<AuthWrapper> {
    if (options && options.headers && Object.getOwnPropertyNames(options.headers).includes("cookie")) {
      const token = CookieHelper.get("AccessToken", (options.headers as any)["cookie"]);
      delete (options.headers as any)["cookie"];
      options.headers = {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...options.headers,
      };
    }

    try {
      return await super.request<AuthWrapper>(url, options);
    } catch (_error: any) {
      const error: ResponseError = _error;
      if (error.error === ErrorMsg.AUTH_EXPIRED_ACCESS) {
        try {
          const res = await this.refreshToken(options.headers);
          const request = await this.request<AuthWrapper>(url, options);
          return (new AuthWrapper(res, request)) as AuthWrapper;
        } catch (error) {
        console.log(error);
      }
    }
    throw error;
  }
}
}