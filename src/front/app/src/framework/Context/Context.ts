import type { UserFriends } from "../../PrivateLayout/FriendsComponent/UserFriends/UserFriends";
import type { Router } from "../Router/Router";

export class Context {
  static router: Router;
  static friends: UserFriends;
}