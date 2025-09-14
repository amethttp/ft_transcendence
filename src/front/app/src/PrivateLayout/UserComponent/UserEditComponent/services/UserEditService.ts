import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { BasicResponse } from "../../../../auth/models/BasicResponse";
import type { UserEditRequest } from "../models/UserEditRequest";

export class UserEditService {
  static readonly USER_ENDPOINT = "/user";
  private _apiClient: ApiClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  editUser(request: UserEditRequest): Promise<BasicResponse> {
    return this._apiClient.put(UserEditService.USER_ENDPOINT, request);
  }

  deleteUser(): Promise<BasicResponse> {
    return this._apiClient.delete(UserEditService.USER_ENDPOINT, null, {credentials: "include"});
  }
}