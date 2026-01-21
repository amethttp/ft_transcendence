import { randomBytes } from "crypto";
import { Tournament } from "../../domain/entities/Tournament";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { ITournamentRoundRepository } from "../../domain/repositories/ITournamentRoundRepository";
import { TournamentRound } from "../../domain/entities/TournamentRound";
import { NewMatchRequest } from "../models/NewMatchRequest";
import { MatchService } from "./MatchService";
import { MatchPlayerService } from "./MatchPlayerService";
import { ITournamentRepository } from "../../domain/repositories/ITournamentRepository";


export class TournamentRoundService {
  private _tournamentRoundRepository: ITournamentRoundRepository;
  private _tournamentRepository: ITournamentRepository;
  private _matchService: MatchService;
  private _matchPlayerService: MatchPlayerService;

  constructor(tournamentRoundRepository: ITournamentRoundRepository, tournamentRepository: ITournamentRepository, matchService: MatchService, matchPlayerService: MatchPlayerService) {
    this._tournamentRoundRepository = tournamentRoundRepository;
    this._tournamentRepository = tournamentRepository;
    this._matchService = matchService;
    this._matchPlayerService = matchPlayerService;
  }

  async createNext(tournament: Tournament): Promise<void> {
    const activePlayers = tournament.players.filter(player => player.round === tournament.round + 1);
    if (activePlayers.length < 2)
      return;
    tournament.round++;
    const idUpdate = await this._tournamentRepository.update(tournament.id, { round: tournament.round });
    if (idUpdate === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const top = activePlayers.length.toString();
    const roundBlueprint: Partial<TournamentRound> = {
      top: top,
      token: randomBytes(8).toString("base64url"),
      tournament: tournament,
    };

    const id = await this._tournamentRoundRepository.create(roundBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const round = await this._tournamentRoundRepository.findById(id);
    if (round === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    for (let i = 0; i < activePlayers.length; i += 2) {
      const matchRequest: NewMatchRequest = {
        name: `${tournament.name} - round of ${round.top}`,
        points: tournament.points,
        tournamentRound: round,
        isVisible: false
      }
      const match = await this._matchService.newMatch(matchRequest);
      await this._matchPlayerService.newMatchPlayer(activePlayers[i].user, match);
      if (activePlayers[i + 1])
        await this._matchPlayerService.newMatchPlayer(activePlayers[i + 1].user, match);
    }
  }
}