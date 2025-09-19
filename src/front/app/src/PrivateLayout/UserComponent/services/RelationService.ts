
import { ApiClient } from "../../../ApiClient/ApiClient";
import type { BasicResponse } from "../../../auth/models/BasicResponse";

export default class RelationService {
  private static readonly BASE_RELATION = "/relation";
  private static readonly GET_FRIENDS = this.BASE_RELATION + "/friends";
  private static readonly GET_REQUESTS = this.BASE_RELATION + "/requests";
  private static readonly ADD_FRIEND_ENDPOINT = this.BASE_RELATION + "/add/";
  private static readonly REMOVE_FRIEND_ENDPOINT = this.BASE_RELATION + "/remove/";
  private static readonly ACCEPT_REQUEST_ENDPOINT = this.BASE_RELATION + "/accept/";
  private static readonly DECLINE_REQUEST_ENDPOINT = this.BASE_RELATION + "/decline/";
  private static readonly BLOCK_USER_ENDPOINT = this.BASE_RELATION + "/block/";
  private static readonly UNBLOCK_USER_ENDPOINT = this.BASE_RELATION + "/unblock/";
  private _apiClient: ApiClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  getUserFriends(): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.GET_FRIENDS);
  }

  getUserRequests(): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.GET_REQUESTS);
  }

  addFriend(username: string): Promise<BasicResponse> { // TODO: change GET methods
    return this._apiClient.get(RelationService.ADD_FRIEND_ENDPOINT + username);
  }

  removeFriend(username: string): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.REMOVE_FRIEND_ENDPOINT + username);
  }

  acceptRequest(username: string): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.ACCEPT_REQUEST_ENDPOINT + username);
  }

  declineRequest(username: string): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.DECLINE_REQUEST_ENDPOINT + username);
  }

  blockUser(username: string): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.BLOCK_USER_ENDPOINT + username);
  }

  unblockUser(username: string): Promise<BasicResponse> {
    return this._apiClient.get(RelationService.UNBLOCK_USER_ENDPOINT + username);
  }
}