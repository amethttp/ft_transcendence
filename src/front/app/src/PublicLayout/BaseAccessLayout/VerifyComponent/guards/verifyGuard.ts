import type { Guard, GuardResult } from "../../../../framework/Router/Route/Guard";

export const verifyGuard: Guard = async (): Promise<GuardResult> => {
  const userId = sessionStorage.getItem("userId");
  if (userId && parseInt(userId))
    return true;
  else
    return { redirect: '/login' };
}
export default verifyGuard;