import { CookieHelper } from "../../CookieHelper/CookieHelper";
import HttpClient from "../HttpClient";
import type { TGetParamValue } from "../IHttpClient";
import { ErrorMsg, ResponseError } from "./models/ResponseError";
import { AuthWrapper } from "./wrappers/AuthWrapper";

export class ApiClient extends HttpClient {
  static readonly BASE_URL = "https://platform";
  private static _refreshPromise: Promise<string> | null = null;

  private static readonly REFRESH_ROUTE = "/auth/access/refresh";

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

  private refreshToken(headers?: HeadersInit): Promise<string> {
    if (ApiClient._refreshPromise) {
      return ApiClient._refreshPromise;
    }
    const refreshPromise = this.get<{ credentials: string }>(ApiClient.REFRESH_ROUTE, undefined, { headers })
      .then((response) => response.credentials)
      .finally(() => {
        ApiClient._refreshPromise = null;
      });
    ApiClient._refreshPromise = refreshPromise;
    return refreshPromise;
  }

  private buildAuthHeaders(headers?: HeadersInit, credentials?: string): HeadersInit {
    const nextHeaders = {
      ...(headers as Record<string, string> || {}),
    };

    const cookie = credentials || nextHeaders.cookie;
    if (cookie) {
      nextHeaders.cookie = cookie;
      const token = CookieHelper.get("AccessToken", cookie);
      if (token) {
        nextHeaders.Authorization = `Bearer ${token}`;
      } else {
        delete nextHeaders.Authorization;
      }
    }

    return nextHeaders;
  }

  private async requestWithRefreshGuard<ResponseType>(
    url: string,
    options: RequestInit = {},
    hasRetried = false
  ): Promise<ResponseType> {
    const requestOptions: RequestInit = {
      ...options,
      headers: this.buildAuthHeaders(options.headers),
    };

    try {
      return await super.request<ResponseType>(url, requestOptions);
    } catch (_error: any) {
      const error: ResponseError = _error;
      const shouldRefresh = (
        error.error === ErrorMsg.AUTH_EXPIRED_ACCESS
        && !url.includes(ApiClient.REFRESH_ROUTE)
        && !hasRetried
      );

      if (!shouldRefresh) {
        throw error;
      }

      const refreshedCredentials = await this.refreshToken(requestOptions.headers);
      const retryOptions: RequestInit = {
        ...requestOptions,
        headers: this.buildAuthHeaders(requestOptions.headers, refreshedCredentials),
      };
      const response = await this.requestWithRefreshGuard<ResponseType>(url, retryOptions, true);
      return (new AuthWrapper(refreshedCredentials, response)) as ResponseType;
    }
  }

  protected async request<ResponseType>(url: string, options: RequestInit = {}): Promise<ResponseType> {
    return this.requestWithRefreshGuard<ResponseType>(url, options);
  }
}