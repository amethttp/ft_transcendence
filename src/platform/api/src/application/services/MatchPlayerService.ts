import { Match } from "../../domain/entities/Match";
import { MatchPlayer } from "../../domain/entities/MatchPlayer";
import { User } from "../../domain/entities/User";
import { IMatchPlayerRepository } from "../../domain/repositories/IMatchPlayerRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { MatchInfo } from "../models/MatchInfo";
import { UserProfile } from "../models/UserProfile";
import { UserService } from "./UserService";
import { Relation, RelationType } from "../models/Relation";
import { StatusType } from "../models/UserStatusDto";
import { MatchResult } from "../models/MatchResult";

export class MatchPlayerService {
  private _matchPlayerRepository: IMatchPlayerRepository;

  constructor(matchPlayerRepository: IMatchPlayerRepository) {
    this._matchPlayerRepository = matchPlayerRepository;
  }

  async newMatchPlayer(user: User, match: Match): Promise<MatchPlayer> {
    const matchPlayerBlueprint: Partial<MatchPlayer> = {
      score: 0,
      isWinner: false,
      user: user,
      match: match,
    };

    const id = await this._matchPlayerRepository.create(matchPlayerBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const matchPlayer = await this._matchPlayerRepository.findById(id);
    if (matchPlayer === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return matchPlayer;
  }

  async updateResult(match: Match, matchResult: MatchResult) {
    const winnerIndex = matchResult.score.findIndex(score => score === Math.max(...matchResult.score));

    const winnerBlueprint: Partial<MatchPlayer> = {
      score: matchResult.score[winnerIndex],
      isWinner: true,
    };
    
    const winner = match.players[winnerIndex];
    const winnerUpdate = await this._matchPlayerRepository.update(winner.id, winnerBlueprint);
    if (winnerUpdate === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    Object.assign(winner, winnerBlueprint);
    const loserBlueprint: Partial<MatchPlayer> = {
      score: matchResult.score[1 - winnerIndex],
      isWinner: false,
    };
    const loser = match.players[1 - winnerIndex];
    const loserUpdate = await this._matchPlayerRepository.update(loser.id, loserBlueprint);
    if (loserUpdate === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    Object.assign(loser, loserBlueprint);
  }

  async getLast10UserMatches(originUser: User): Promise<MatchInfo[]> {
    const matches = await this._matchPlayerRepository.findLastAmountByUser(originUser.id, 10);
    if (matches === null)
      return [] as MatchInfo[];

    const matchesWithPlayers = await Promise.all(
      matches.map(async matchPlayer => {
        matchPlayer.match.players = await this.getAllSingleMatchPlayers(matchPlayer.match); // TODO: criminal query
        return matchPlayer;
      })
    );
    const matchesInfo = matchesWithPlayers.map(match => this.toMatchInfo(match));
    return matchesInfo;
  }

  async getAllUserMatchesInfo(originUser: User): Promise<MatchInfo[]> {
    const test = await this._matchPlayerRepository.findAllUserMatchesInfo(originUser.id);

    if (test === null)
      return [] as MatchInfo[];

    const testInfo = test.map(matchPlayer => this.toMatchInfo(matchPlayer));
    return testInfo;
  }

  async getAllSingleMatchPlayers(match: Match): Promise<MatchPlayer[]> {
    const matches = await this._matchPlayerRepository.findAllByMatch(match.id);
    if (matches === null)
      return [] as MatchPlayer[];

    return matches;
  }

  async deleteAllFromMatch(match: Match) {
    await Promise.all(match.players.map(player => this.delete(player)));
  }

  async delete(matchPlayer: MatchPlayer) {
    if (!(await this._matchPlayerRepository.delete(matchPlayer.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  public toMatchInfo(mPlayer: MatchPlayer): MatchInfo {
    let opponent: MatchPlayer;
    const matchInfo: MatchInfo = {
      name: mPlayer.match.name,
      state: mPlayer.match.state,
      score: mPlayer.score,
      opponentScore: 0,
      opponent: undefined as any as UserProfile,
      isWinner: mPlayer.isWinner,
      finishTime: mPlayer.match.finishTime || "Aborted"
    }

    if (mPlayer.match.players && mPlayer.match.players.length > 1) {
      opponent = (mPlayer.match.players[0].user.id === mPlayer.user.id)
        ? mPlayer.match.players[1]
        : mPlayer.match.players[0];
      const relation: Relation = {
        type: RelationType.NO_RELATION,
        owner: false,
        updateTime: "",
      };

      matchInfo.opponentScore = opponent.score;
      matchInfo.opponent = UserService.toUserProfile(opponent.user, relation, StatusType.OFFLINE);
    }

    return matchInfo;
  }

  public countWins(matches: MatchInfo[]): number {
    let wins = 0;
    for (const match of matches) {
      if (match.isWinner) // TODO: check only non-tournament games?
        wins++;
    }

    return wins;
  }

  async getById(playerId: number): Promise<MatchPlayer> {
    const player = await this._matchPlayerRepository.findById(playerId);
    if (!player)
      throw new ResponseError(ErrorParams.PLAYER_NOT_FOUND);
    return player;
  }

  async getByUserAndMatch(userId: number, matchId: number): Promise<MatchPlayer> {
    const player = await this._matchPlayerRepository.findByUserAndMatch(userId, matchId);
    if (!player)
      throw new ResponseError(ErrorParams.PLAYER_NOT_FOUND);
    return player;
  }
}