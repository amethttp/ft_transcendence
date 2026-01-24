
import { Tournament, TournamentState } from "../../domain/entities/Tournament";
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
    const round = tournament?.rounds[tournament.rounds.length - 1];
    if (!round)
      return;
    else if (round.matches.length === 1 && round.matches[0].state === MatchState.FINISHED) {
      await this._updateWinnerPlayer(tournament, matchResult);
      tournament.state = TournamentState.FINISHED;
      const id = await this._tournamentRepository.update(tournament.id, { state: tournament.state, finishTime: new Date().toISOString() });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    else {
      await this._updateMatchPlayers(tournament, matchResult);
      const ongoingMatch = round?.matches.find(match => match.state != MatchState.FINISHED);
      if (!ongoingMatch)
        this._tournamentRoundService.createNext(tournament);
    }
  }

  private async _updateMatchPlayers(tournament: Tournament, matchResult: MatchResult) {
    const winnerPlayer = this._getWinnerPlayer(matchResult, tournament);
    if (winnerPlayer) {
      winnerPlayer.round++;
      const id = await this._tournamentPlayerRepository.update(winnerPlayer.id, { round: winnerPlayer.round });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      matchResult.players.forEach(async (player) => {
        if (player.username !== winnerPlayer.user.username) {
          const loserPlayer = tournament.players.find(pl => player.username === pl.user.username);
          if (loserPlayer) {
            loserPlayer.isAlive = false;
            const id = await this._tournamentPlayerRepository.update(loserPlayer.id, { isAlive: loserPlayer.isAlive });
            if (id === null)
              throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
          }
        }
      });
    }
    else {
      console.error("Winner player not found in tournament players");
    }
  }

  private async _updateWinnerPlayer(tournament: Tournament, matchResult: MatchResult) {
    const winnerPlayer = this._getWinnerPlayer(matchResult, tournament);
    if (winnerPlayer) {
      winnerPlayer.isWinner = true;
      const id = await this._tournamentPlayerRepository.update(winnerPlayer.id, { isWinner: winnerPlayer.isWinner });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    else {
      console.error("Winner player not found in tournament players");
    }
  }

  private _getWinnerPlayer(matchResult: MatchResult, tournament: Tournament) {
    const winningScore = Math.max(...matchResult.score)
    const winnerIndex = matchResult.score.indexOf(winningScore);
    const winnerPlayer = tournament.players.find(pl => matchResult.players[winnerIndex].username === pl.user.username);
    return winnerPlayer;
  }
}