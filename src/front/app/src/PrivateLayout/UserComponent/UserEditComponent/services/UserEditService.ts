import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { BasicResponse } from "../../../../auth/models/BasicResponse";
import type { UserEditRequest } from "../models/UserEditRequest";

export class UserEditService {
  static readonly EDIT_USER_ENDPOINT = "/user";
  private _apiClient: ApiClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  editUser(request: UserEditRequest): Promise<BasicResponse> {
    return this._apiClient.put(UserEditService.EDIT_USER_ENDPOINT, request);
  }
}