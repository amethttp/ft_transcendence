import type Path from "../../../../framework/Router/Path/Path";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";
import { LoggedUser } from "../../../../auth/LoggedUser";
import { MatchService } from "../services/MatchService";
import Alert from "../../../../framework/Alert/Alert";

const matchResolver: Resolver = async (path: Path) => {
  const matchService = new MatchService();
  try {
    if (path.params['token']) {
      const match = await matchService.getJoinMatch(path.params['token'] as string);
      const loggedUser = await LoggedUser.get();
      const isInMatch = typeof loggedUser?.id === "number"
        && match.players.some(player => player.user.id === loggedUser.id);
      if (!isInMatch) {
        const tournamentToken = match.tournamentRound?.tournament?.token;
        if (tournamentToken) {
          return `/play/tournament/${tournamentToken}`;
        }
        Alert.error("Could not join the match.");
        return '/play';
      }
      return {match};
    }
    else {
      Alert.error("Could not join the match.");
      return '/play';
    }
  }
  catch (e: any) {
    Alert.error("Could not join the match.");
    return '/play';
  }
};

export default matchResolver;
