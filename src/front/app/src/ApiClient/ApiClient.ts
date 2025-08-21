import type { BasicResponse } from "../auth/models/BasicResponse";
import { CookieHelper } from "../framework/CookieHelper/CookieHelper";
import HttpClient from "../framework/HttpClient/HttpClient";
import type { TGetParamValue } from "../framework/HttpClient/IHttpClient";

export class ApiClient extends HttpClient {
  static readonly BASE_URL = "http://localhost:8080";

  constructor() {
    super();
  }

  async get<ResponseType>(path: string, params?: Record<string, TGetParamValue>, options?: RequestInit): Promise<ResponseType> {
    return super.get(ApiClient.BASE_URL + path, params, options);
  }

  async post<BodyType, ResponseType>(path: string, body?: BodyType, options?: RequestInit): Promise<ResponseType> {
    return super.post<BodyType, ResponseType>(ApiClient.BASE_URL + path, body, options);
  }

  private refreshToken(): Promise<BasicResponse> {
    return this.get("/auth/refresh", undefined, {credentials: "include"});
  }

  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = CookieHelper.get("AccessToken");
    options.headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      return await super.request<T>(url, options);
    } catch (error: any) {
      if (error["status"] === 401 && error["error"]["code"] === "FST_JWT_NO_AUTHORIZATION_IN_HEADER") {
        try {
          if ((await this.refreshToken()).success)
            return this.request<T>(url, options);
        } catch (_error) {
          throw _error;
        }
      }
      throw error;
    }
  }
}