import { LoggedUser } from "../../../auth/LoggedUser";
import type Path from "../../../framework/Router/Path/Path";
import type { Resolver } from "../../../framework/Router/Route/Resolver";
import UserProfileService from "../services/UserProfileService";

const userComponentResolver: Resolver = async (path: Path) => {
  const userProfileService = new UserProfileService();
  const username = path.params["userId"] as string;
  try {
    if (username)
    {
      const userProfile = await userProfileService.getUserProfile(username);
      if (userProfile) {
        return { userProfile };
      }
      else
        return '/404';
    }
    else
      return {userProfile: await LoggedUser.get(true)};
  } catch (error) {
    return '/404';
  }
};

export default userComponentResolver;
