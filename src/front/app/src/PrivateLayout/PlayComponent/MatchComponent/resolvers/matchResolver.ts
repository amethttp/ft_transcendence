import type Path from "../../../../framework/Router/Path/Path";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";
import { MatchService } from "../services/MatchService";

const matchResolver: Resolver = async (path: Path) => {
  const matchService = new MatchService();
  try {
    if (path.params['token']) {
      const match = await matchService.getJoinMatch(path.params['token'] as string);
      return {match};
    }
    else {
      return '/play';
    }
  }
  catch (e: any) {
    return '/play';
  }
};

export default matchResolver;
