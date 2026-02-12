import type Path from "../../../framework/Router/Path/Path";
import type { Resolver } from "../../../framework/Router/Route/Resolver";
import type UserProfile from "../models/UserProfile";
import UserProfileService from "../services/UserProfileService";

const userComponentResolver: Resolver = async (path: Path) => {
  const userProfileService = new UserProfileService();
  const username = path.params["userId"] as string;
  try {
    const userProfile = (await userProfileService.getUserProfile(username)) as unknown as UserProfile;
    if (userProfile)
      return { userProfile };
    else
      return '/404';
  } catch (error) {
    return '/404';
  }
};

export default userComponentResolver;
