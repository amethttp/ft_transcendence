import { CookieHelper } from "../../framework/CookieHelper/CookieHelper";
import type { Guard } from "../../framework/Router/Route/Guard";

export const authGuard: Guard = async (): Promise<boolean> => {
  // TODO: Make an API call to ensure logged status!
  return CookieHelper.get("AccessToken") != null;
}
export default authGuard;