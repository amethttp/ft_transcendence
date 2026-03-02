import Alert from "../../../../framework/Alert/Alert";
import type Path from "../../../../framework/Router/Path/Path";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";
import { TournamentService } from "../services/TournamentService";

const tournamentResolver: Resolver = async (path: Path) => {
  const tournamentService = new TournamentService();
  try {
      const token = path.params.token;
      if (token) {
        const tournament = await tournamentService.getByToken(token as string);
        return {tournament: tournament};
      }
      else
        Alert.error('Could not find the tournament.');
        return "/play/tournaments";
    } catch (error) {
      Alert.error('Could not find the tournament.');
      return "/play/tournaments";
    }
};

export default tournamentResolver;
