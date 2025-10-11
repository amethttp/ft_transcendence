import { CookieHelper } from "../../CookieHelper/CookieHelper";
import HttpClient from "../HttpClient";
import type { TGetParamValue } from "../IHttpClient";

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

  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    if (Object.getOwnPropertyNames(options.headers).includes("cookie")) {
      const token = CookieHelper.get("AccessToken", (options.headers as any)["cookie"]);
      delete (options.headers as any)["cookie"];
      options.headers = {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...options.headers,
      };
    }

    return await super.request<T>(url, options);
  }
}