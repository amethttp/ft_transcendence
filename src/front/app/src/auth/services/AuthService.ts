import { ApiClient } from "../../ApiClient/ApiClient";
import type User from "../../PrivateLayout/UserComponent/UserProfileComponent/models/User";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import type { BasicResponse } from "../models/BasicResponse";
import type { CreatePasswordRequest } from "../models/CreatePasswordRequest";
import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";
import type { RecoverRequest } from "../models/RecoverRequest";
import type { RegisterRequest } from "../models/RegisterRequest";
import type { VerifyRequest } from "../models/VerifyRequest";

export class AuthService {
  private static readonly BASE = "/auth";
  private static readonly LOGIN_ENDPOINT = this.BASE + "/login";
  private static readonly VERIFY_ENDPOINT = this.LOGIN_ENDPOINT + "/verify";
  private static readonly RECOVER_ENDPOINT = this.BASE + "/recover";
  private static readonly REGISTER_ENDPOINT = this.BASE + "/register";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginRequest, LoginResponse>(AuthService.LOGIN_ENDPOINT, request);
  }

  async verify(request: VerifyRequest): Promise<BasicResponse> {
    return this.http.post<VerifyRequest, BasicResponse>(AuthService.VERIFY_ENDPOINT, request, { credentials: "include" });
  }

  async recover(request: RecoverRequest): Promise<BasicResponse> {
    return this.http.post<RecoverRequest, BasicResponse>(AuthService.RECOVER_ENDPOINT, request);
  }

  async checkCreatePassword(token: string): Promise<User> {
    return this.http.get<User>(AuthService.RECOVER_ENDPOINT + "/" + token);
  }

  async createPassword(request: CreatePasswordRequest, token: string): Promise<BasicResponse> {
    return this.http.post<CreatePasswordRequest, BasicResponse>(AuthService.RECOVER_ENDPOINT + "/" + token, request);
  }

  async logout(): Promise<BasicResponse> {
    return this.http.delete<null, BasicResponse>(AuthService.LOGIN_ENDPOINT, null, { credentials: "include" });
  }

  register(request: RegisterRequest): Promise<BasicResponse> {
    return this.http.post<RegisterRequest, BasicResponse>(AuthService.REGISTER_ENDPOINT, request, { credentials: "include" });
  }

}