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
        return "/play/tournaments";
    } catch (error) {
      return "/play/tournaments";
    }
};

export default tournamentResolver;
