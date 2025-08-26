import { ApiClient } from "../../ApiClient/ApiClient";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import { LoggedUser } from "../LoggedUser";
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

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.http.post<LoginRequest, LoginResponse>(AuthService.LOGIN_ENDPOINT, request, {credentials: "include"});
      if (response.success)
        await LoggedUser.get(true);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<BasicResponse> {
    try {
      const response = await this.http.delete<null, BasicResponse>(AuthService.LOGIN_ENDPOINT, null, {credentials: "include"});
      if (response.success)
        await LoggedUser.get(true);
      return response;
    } catch (error) {
      throw error;
    }
  }

}