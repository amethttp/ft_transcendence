import type User from "./models/User";
import { AuthService } from "./services/AuthService";

export class LoggedUser {
  private static _user: User | null | undefined;
  private static _authService: AuthService = new AuthService();

  static async get(reload: boolean = false): Promise<User | null> {
    if (!reload && this._user !== undefined)
      return this._user;
    else {
      try {
        this._user = await this._authService.getLoggedUser()
      } catch (error) {
        this._user = null;
      }
      return this._user;
    }
  }
}