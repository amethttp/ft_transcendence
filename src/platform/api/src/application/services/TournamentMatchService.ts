
import { Tournament, TournamentState } from "../../domain/entities/Tournament";
import { ITournamentRepository } from "../../domain/repositories/ITournamentRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { MatchResult } from "../models/MatchResult";
import { Match, MatchState } from "../../domain/entities/Match";
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

  async updateMatchScore(matchResult: MatchResult, match: Match) {
    const tournament = await this._tournamentRepository.findByToken(match.tournamentRound!.tournament.token);
    console.log("UPDATE MATCH SCORE");
    console.log("Tournament found:", tournament);
    console.log("Match:", match);
    if (!tournament)
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    const round = tournament?.rounds[tournament.rounds.length - 1];
    if (!round)
      return;

    const currentRoundMatch = round.matches.find(roundMatch => roundMatch.token === match.token);
    if (currentRoundMatch) {
      currentRoundMatch.state = MatchState.FINISHED;
    }

    if (round.matches.length === 1 && round.matches[0].state === MatchState.FINISHED) {
      await this._updateTournamentWinnerPlayer(matchResult, match, tournament);
      tournament.state = TournamentState.FINISHED;
      const id = await this._tournamentRepository.update(tournament.id, { state: tournament.state, finishTime: new Date().toISOString() });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    else {
      await this._updateMatchPlayers(matchResult, match, tournament);
      const ongoingMatch = round?.matches.find(_match => _match.state != MatchState.FINISHED);
      if (!ongoingMatch)
        await this._tournamentRoundService.createNext(tournament);
    }
  }

  private async _updateMatchPlayers(matchResult: MatchResult, match: Match, tournament: Tournament) {
    const winnerPlayer = this._getWinnerPlayer(matchResult, match, tournament);
    if (winnerPlayer) {
      winnerPlayer.round++;
      const id = await this._tournamentPlayerRepository.update(winnerPlayer.id, { round: winnerPlayer.round });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      const winnerIndex = matchResult.score.indexOf(Math.max(...matchResult.score));
      const loserMatchPlayer = match.players[1 - winnerIndex];
      const loserPlayer = loserMatchPlayer
        ? tournament.players.find(pl => pl.user.id === loserMatchPlayer.user.id)
        : undefined;
      if (loserPlayer) {
        loserPlayer.isAlive = false;
        const loserUpdateId = await this._tournamentPlayerRepository.update(loserPlayer.id, { isAlive: loserPlayer.isAlive });
        if (loserUpdateId === null)
          throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      }
    }
    else {
      console.error("Winner player not found in tournament players");
    }
  }

  private async _updateTournamentWinnerPlayer(matchResult: MatchResult, match: Match, tournament: Tournament) {
    const winnerPlayer = this._getWinnerPlayer(matchResult, match, tournament);
    if (winnerPlayer) {
      winnerPlayer.isWinner = true;
      let id = await this._tournamentPlayerRepository.update(winnerPlayer.id, { isWinner: winnerPlayer.isWinner });
      if (id === null)
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      const loserPlayer = tournament.players.find(pl => pl.isAlive && !pl.isWinner);
      if (loserPlayer) {
        loserPlayer.isAlive = false;
        id = await this._tournamentPlayerRepository.update(loserPlayer.id, { isAlive: loserPlayer.isAlive });
        if (id === null)
          throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      }
    }
    else {
      console.error("Winner player not found in tournament players");
    }
  }

  private _getWinnerPlayer(matchResult: MatchResult, match: Match, tournament: Tournament) {
    const winnerIndex = matchResult.score.indexOf(Math.max(...matchResult.score));
    const winnerMatchPlayer = match.players[winnerIndex];
    if (!winnerMatchPlayer)
      return undefined;
    const winnerPlayer = tournament.players.find(pl => winnerMatchPlayer.user.id === pl.user.id);
    return winnerPlayer;
  }
}