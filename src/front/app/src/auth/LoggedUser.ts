import type UserProfile from "../PrivateLayout/UserComponent/UserProfileComponent/models/UserProfile";
import UserProfileService from "../PrivateLayout/UserComponent/UserProfileComponent/services/UserProfileService";

export class LoggedUser {
  private static _user: UserProfile | null | undefined;
  private static _userProfileService: UserProfileService = new UserProfileService();

  static async get(reload: boolean = false): Promise<UserProfile | null> {
    if (!reload && this._user !== undefined)
      return this._user;
    else {
      try {
        this._user = await this._userProfileService.getLoggedUser()
      } catch (error) {
        this._user = null;
      }
      console.log(this._user);
      return this._user;
    }
  }
}