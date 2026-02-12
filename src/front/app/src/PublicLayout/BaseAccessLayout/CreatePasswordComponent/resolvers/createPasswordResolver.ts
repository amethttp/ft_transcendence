import { AuthService } from "../../../../auth/services/AuthService";
import Alert from "../../../../framework/Alert/Alert";
import type Path from "../../../../framework/Router/Path/Path";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";

const invalidToken = () => {
  Alert.error("Invalid create password link", "Please re-submit create password.");
  return "/login";
};

export const createPasswordResolver: Resolver = async (path: Path) => {
  const authService = new AuthService();
  let token = path.params["token"];
  if (token) {
    token = token.toString();
    try {
      let user = await authService.checkCreatePassword(token);
      if (user)
        return { user, token };
      else
        return invalidToken();
    }
    catch (e) {
      return invalidToken();
    };
  }
  else
    return invalidToken();
}