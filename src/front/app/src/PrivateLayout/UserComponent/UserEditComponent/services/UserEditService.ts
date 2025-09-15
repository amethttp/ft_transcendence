import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { BasicResponse } from "../../../../auth/models/BasicResponse";
import type { UserEditRequest } from "../models/UserEditRequest";

export class UserEditService {
  static readonly USER_ENDPOINT = "/user";
  static readonly AVATAR_ENDPOINT = this.USER_ENDPOINT + "/avatar";
  private _apiClient: ApiClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  editUser(request: UserEditRequest): Promise<BasicResponse> {
    return this._apiClient.put(UserEditService.USER_ENDPOINT, request);
  }

  deleteUser(): Promise<BasicResponse> {
    return this._apiClient.delete(UserEditService.USER_ENDPOINT, null, { credentials: "include" });
  }

  uploadAvatar(formData: FormData): Promise<BasicResponse> {
    return this._apiClient.post(UserEditService.AVATAR_ENDPOINT, formData);
  }
}