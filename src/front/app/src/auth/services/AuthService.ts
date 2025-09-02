import { ApiClient } from "../../ApiClient/ApiClient";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import { LoggedUser } from "../LoggedUser";
import type { BasicResponse } from "../models/BasicResponse";
import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";
import type { RegisterRequest } from "../models/RegisterRequest";

export class AuthService {
  private static readonly BASE = "/auth";
  private static readonly LOGIN_ENDPOINT = this.BASE + "/login";
  private static readonly REGISTER_ENDPOINT = "/user";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginRequest, LoginResponse>(AuthService.LOGIN_ENDPOINT, request, { credentials: "include" });
  }

  async logout(): Promise<BasicResponse> {
    try {
      const response = await this.http.delete<null, BasicResponse>(AuthService.LOGIN_ENDPOINT, null, { credentials: "include" });
      if (response.success)
        await LoggedUser.get(true);
      return response;
    } catch (error) {
      throw error;
    }
  }

  register(request: RegisterRequest): Promise<BasicResponse> {
    return this.http.post<LoginRequest, LoginResponse>(AuthService.REGISTER_ENDPOINT, request, { credentials: "include" });
  }

}