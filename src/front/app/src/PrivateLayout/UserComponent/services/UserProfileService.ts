
import { ApiClient } from "../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../framework/HttpClient/IHttpClient";
import type User from "../../../auth/models/User";
import type RelationRequest from "../models/RelationRequest";
import type RelationResponse from "../models/RelationResponse";

export default class UserProfileService {
  private static readonly BASE = "/user";
  private static readonly PROFILE_ENDPOINT = this.BASE + "/";
  private static readonly RELATION_ENDPOINT = this.BASE + "/relation";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  getUserProfile(userName: string): Promise<User> {
    return this.http.get(UserProfileService.PROFILE_ENDPOINT + userName);
  }

  sendRelationRequest(request: RelationRequest): Promise<User> {
    return this.http.post<RelationRequest, RelationResponse>(UserProfileService.RELATION_ENDPOINT, request);
  }
}