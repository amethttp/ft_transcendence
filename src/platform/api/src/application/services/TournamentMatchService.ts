
import { Tournament } from "../../domain/entities/Tournament";
import { ITournamentRepository } from "../../domain/repositories/ITournamentRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { MatchResult } from "../models/MatchResult";
import { MatchState } from "../../domain/entities/Match";
import { TournamentRoundService } from "./TournamentRoundService";
import { ITournamentPlayerRepository } from "../../domain/repositories/ITournamentPlayerRepository";


export class TournamentMatchService {
  private _tournamentRepository: ITournamentRepository;
  private _tournamentRoundService: TournamentRoundService;
  private _tournamentPlayerRepository: ITournamentPlayerRepository;

  constructor(tournamentRepository: ITournamentRepository, tournamentPlayerRepository: ITournamentPlayerRepository, tournamentRoundService: TournamentRoundService) {
    this._tournamentRepository = tournamentRepository;
    this._tournamentPlayerRepository = tournamentPlayerRepository;
    this._tournamentRoundService = tournamentRoundService;
  }

  async updateMatchScore(matchResult: MatchResult, tournamentToken: string) {
    const tournament = await this._tournamentRepository.findByToken(tournamentToken);
    if (!tournament)
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    await this._updateWinnerPlayer(tournament, matchResult);
    const round = tournament?.rounds[tournament.rounds.length - 1];
    const ongoingMatch = round?.matches.find(match => match.state != MatchState.FINISHED);
    if (!ongoingMatch)
      this._tournamentRoundService.createNext(tournament);
  }

  private async _updateWinnerPlayer(tournament: Tournament, matchResult: MatchResult) {
    const winningScore = Math.max(...matchResult.score)
    const winnerIndex = matchResult.score.indexOf(winningScore);
    const winnerPlayer = tournament.players.find(pl => matchResult.players[winnerIndex].username === pl.user.username);
    if (winnerPlayer) {
      winnerPlayer.round++;
      const id = await this._tournamentPlayerRepository.update(winnerPlayer.id, { round: winnerPlayer.round });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    else {
      console.warn("Winner player not found in tournament players", { matchResult, tournament_pl: tournament.players, winnerIndex });
    }
  }
}