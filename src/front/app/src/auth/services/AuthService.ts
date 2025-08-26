import { ApiClient } from "../../ApiClient/ApiClient";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import type { BasicResponse } from "../models/BasicResponse";
import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";

export class AuthService {
  private static readonly BASE = "/auth";
  private static readonly LOGIN_ENDPOINT = this.BASE + "/login";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  login(request: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginRequest, LoginResponse>(AuthService.LOGIN_ENDPOINT, request, {credentials: "include"});
  }

  async logout() {
    await this.http.delete<null, BasicResponse>(AuthService.LOGIN_ENDPOINT, null, {credentials: "include"});
  }

}