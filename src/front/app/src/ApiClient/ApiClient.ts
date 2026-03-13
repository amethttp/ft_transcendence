import type { BasicResponse } from "../auth/models/BasicResponse";
import { Context } from "../framework/Context/Context";
import { CookieHelper } from "../framework/CookieHelper/CookieHelper";
import HttpClient from "../framework/HttpClient/HttpClient";
import type { TGetParamValue } from "../framework/HttpClient/IHttpClient";
import { ErrorMsg, type ResponseError } from "./models/ResponseError";

export class ApiClient extends HttpClient {
  static readonly BASE_URL = import.meta.env.VITE_API_URL;
  private static _refreshPromise: Promise<BasicResponse> | null = null;
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

  async download(path: string, options: RequestInit = {}): Promise<void> {
    const url = ApiClient.BASE_URL + path;
    await this.downloadRequest(url, options);
  }

  private refreshToken(): Promise<BasicResponse> {
    if (ApiClient._refreshPromise) {
      return ApiClient._refreshPromise;
    }
    const refreshPromise = this.get<BasicResponse>("/auth/refresh", undefined, { credentials: "include" })
      .finally(() => {
        ApiClient._refreshPromise = null;
      });
    ApiClient._refreshPromise = refreshPromise;
    return refreshPromise;
  }

  private buildAuthorizedOptions(options: RequestInit = {}): RequestInit {
    const token = CookieHelper.get("AccessToken");
    return {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    };
  }

  private getDownloadFileName(response: Response): string {
    const contentDisposition = response.headers.get("Content-Disposition");
    const fileNameMatch = contentDisposition?.match(/filename=([^;]+)/i);
    return fileNameMatch?.[1]?.replace(/^"|"$/g, "") || "amethpong-export.json";
  }

  private triggerBrowserDownload(blob: Blob, fileName: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  private async downloadRequest(url: string, options: RequestInit = {}): Promise<void> {
    const authorizedOptions = this.buildAuthorizedOptions(options);

    try {
      const response = await fetch(url, authorizedOptions);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, ...errorData };
      }

      const blob = await response.blob();
      this.triggerBrowserDownload(blob, this.getDownloadFileName(response));
    } catch (_error: any) {
      if (_error.name === 'AbortError') {
        throw _error;
      }
      const error: ResponseError = _error;
      if (error.error === ErrorMsg.AUTH_EXPIRED_ACCESS) {
        try {
          const res = await this.refreshToken();
          if (res.success) {
            return this.downloadRequest(url, options);
          }
        } catch {
          if (this._redirect)
            Context.router.navigateByPath("/");
        }
      }
      throw error;
    }
  }

  protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    options = this.buildAuthorizedOptions(options);

    try {
      return await super.request<T>(url, options);
    } catch (_error: any) {
      if (_error.name === 'AbortError') {
        throw _error;
      }
      const error: ResponseError = _error;
      if (error.error === ErrorMsg.AUTH_EXPIRED_ACCESS) {
        if (url.includes("/auth/refresh")) {
          throw error;
        }
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