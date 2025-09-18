
import { ApiClient } from "../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../framework/HttpClient/IHttpClient";
import type User from "../../../auth/models/User";
import type RelationRequest from "../models/RelationRequest";
import type RelationResponse from "../models/RelationResponse";

export default class UserProfileService {
  private static readonly BASE = "/user";
  private static readonly PROFILE_ENDPOINT = this.BASE + "/";
  private static readonly RELATION_ENDPOINT = this.BASE + "/relation";
  private static readonly ADD_FRIEND_ENDPOINT = this.RELATION_ENDPOINT + "/add/";
  private static readonly REMOVE_FRIEND_ENDPOINT = this.RELATION_ENDPOINT + "/remove/";
  private static readonly BLOCK_USER_ENDPOINT = this.RELATION_ENDPOINT + "/block/";
  private static readonly UNBLOCK_USER_ENDPOINT = this.RELATION_ENDPOINT + "/unblock/";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  getUserProfile(username: string): Promise<User> {
    return this.http.get(UserProfileService.PROFILE_ENDPOINT + username);
  }

  addFriend(username: string) {
    return this.http.post(UserProfileService.ADD_FRIEND_ENDPOINT + username);
  }
  removeFriend(username: string) {
    return this.http.post(UserProfileService.REMOVE_FRIEND_ENDPOINT + username);
  }
  blockUser(username: string) {
    return this.http.post(UserProfileService.BLOCK_USER_ENDPOINT + username);
  }
  unblockUser(username: string) {
    return this.http.post(UserProfileService.UNBLOCK_USER_ENDPOINT + username);
  }
}