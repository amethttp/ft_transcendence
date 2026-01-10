import { ApiClient } from "../../ApiClient/ApiClient";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import type { BasicResponse } from "../models/BasicResponse";
import type { CreatePasswordRequest } from "../models/CreatePasswordRequest";
import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";
import type { RecoverRequest } from "../models/RecoverRequest";
import type { RegisterRequest } from "../models/RegisterRequest";
import type User from "../models/User";
import type { VerifyRequest } from "../models/VerifyRequest";

export class AuthService {
  private static readonly BASE = "/auth";
  private static readonly LOGIN_ENDPOINT = this.BASE + "/login";
  private static readonly LOGOUT_ENDPOINT = this.BASE + "/logout";
  private static readonly VERIFY_ENDPOINT = this.LOGIN_ENDPOINT + "/verify";
  private static readonly RECOVER_ENDPOINT = this.BASE + "/recover";
  private static readonly REGISTER_ENDPOINT = this.BASE + "/register";
  private static readonly LOGGED_USER_ENDPOINT = "/user";
  private static readonly GOOGLE_URL_ENDPOINT = this.BASE + "/google/url";
  private static readonly GOOGLE_AUTH_ENDPOINT = this.BASE + "/google/callback";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient(false);
  }

  login(request: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginRequest, LoginResponse>(AuthService.LOGIN_ENDPOINT, request);
  }

  verify(request: VerifyRequest): Promise<BasicResponse> {
    return this.http.post<VerifyRequest, BasicResponse>(AuthService.VERIFY_ENDPOINT, request, { credentials: "include" });
  }

  recover(request: RecoverRequest): Promise<BasicResponse> {
    return this.http.post<RecoverRequest, BasicResponse>(AuthService.RECOVER_ENDPOINT, request);
  }

  checkCreatePassword(token: string): Promise<User> {
    return this.http.get<User>(AuthService.RECOVER_ENDPOINT + "/" + token);
  }

  createPassword(request: CreatePasswordRequest, token: string): Promise<BasicResponse> {
    return this.http.post<CreatePasswordRequest, BasicResponse>(AuthService.RECOVER_ENDPOINT + "/" + token, request);
  }

  logout(): Promise<BasicResponse> {
    return this.http.post<null, BasicResponse>(AuthService.LOGOUT_ENDPOINT, null, { credentials: "include" });
  }

  register(request: RegisterRequest): Promise<BasicResponse> {
    return this.http.post<RegisterRequest, BasicResponse>(AuthService.REGISTER_ENDPOINT, request, { credentials: "include" });
  }

  getGoogleAuthUrl(): Promise<{ url: string }> {
    return this.http.get(AuthService.GOOGLE_URL_ENDPOINT);
  }

  // TODO: Add proper typing for the request (code)
  authenticateWithGoogle(code: string): Promise<LoginResponse> {
    return this.http.post<{ code: string }, LoginResponse>(AuthService.GOOGLE_AUTH_ENDPOINT, { code }, { credentials: "include" });
  }

  getLoggedUser(): Promise<User> {
    return this.http.get(AuthService.LOGGED_USER_ENDPOINT);
  }
}
