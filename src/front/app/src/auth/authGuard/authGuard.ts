import type { Guard } from "../../framework/Router/Route/Guard";

export const authGuard: Guard = async (): Promise<boolean> => {
  try {
    return true;
  } catch (error) {
    return false;
  }
}
export default authGuard;