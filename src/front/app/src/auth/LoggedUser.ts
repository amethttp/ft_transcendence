import type User from "../PrivateLayout/UserComponent/UserProfileComponent/models/User";
import UserProfileService from "../PrivateLayout/UserComponent/UserProfileComponent/services/UserProfileService";

export class LoggedUser {
  private static _user: User | null | undefined;
  private static _userProfileService: UserProfileService = new UserProfileService();

  static async get(reload: boolean = false): Promise<User | null> {
    if (!reload && this._user !== undefined)
      return this._user;
    else {
      try {
        this._user = await this._userProfileService.getLoggedUser()
      } catch (error) {
        this._user = null;
      }
      return this._user;
    }
  }
}