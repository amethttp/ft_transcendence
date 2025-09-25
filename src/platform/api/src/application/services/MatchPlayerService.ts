import { randomInt } from "crypto";
import { Match } from "../../domain/entities/Match";
import { MatchPlayer } from "../../domain/entities/MatchPlayer";
import { User } from "../../domain/entities/User";
import { IMatchPlayerRepository } from "../../domain/repositories/IMatchPlayerRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { MatchInfo } from "../models/MatchInfo";
import { UserProfileResponse } from "../models/UserProfileResponse";
import { UserService } from "./UserService";
import { Relation, RelationInfo } from "../models/RelationInfo";

export class MatchPlayerService {
  private _matchPlayerRepository: IMatchPlayerRepository;

  constructor(matchPlayerRepository: IMatchPlayerRepository) {
    this._matchPlayerRepository = matchPlayerRepository;
  }

  async newMatchPlayer(user: User, match: Match): Promise<MatchPlayer> {
    const matchPlayerBlueprint: Partial<MatchPlayer> = {
      score: randomInt(5), // TODO: Change placeholder
      isWinner: randomInt(2)? true : false,
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

  async getLast10UserMatches(originUser: User): Promise<MatchInfo[]> {
    const matches = await this._matchPlayerRepository.findLastAmountByUser(originUser.id, 10);
    if (matches === null)
      return [] as MatchInfo[];

    const matchesWithPlayers = await Promise.all (
        matches.map(async matchPlayer => { 
        matchPlayer.match.players = await this.getAllSingleMatchPlayers(matchPlayer.match); // TODO: criminal query
        return matchPlayer;
      })
    );
    const matchesInfo = matchesWithPlayers.map(match => this.toMatchInfo(match));
    return matchesInfo;
  }

  async getAllUserMatchesInfo(originUser: User): Promise<MatchInfo[]> {
    const matches = await this._matchPlayerRepository.findAllByUser(originUser.id);
    if (matches === null)
      return [] as MatchInfo[];

    const matchesWithPlayers = await Promise.all (
        matches.map(async matchPlayer => { 
        matchPlayer.match.players = await this.getAllSingleMatchPlayers(matchPlayer.match); // TODO: criminal query
        return matchPlayer;
      })
    );

    const matchesInfo = matchesWithPlayers.map(match => this.toMatchInfo(match));
    return matchesInfo;
  }

  async getAllSingleMatchPlayers(match: Match): Promise<MatchPlayer[]> {
    const matches = await this._matchPlayerRepository.findAllByMatch(match.id);
    if (matches === null) 
      return [] as MatchPlayer[];

    return matches;
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
      opponent: undefined as any as UserProfileResponse,
      isWinner: mPlayer.isWinner,
      finishTime: mPlayer.match.finishTime || "Aborted"
    }   

    if (mPlayer.match.players && mPlayer.match.players.length > 1) {
      opponent = (mPlayer.match.players[0].user.id === mPlayer.user.id)
      ? mPlayer.match.players[1]
      : mPlayer.match.players[0];
      const relation: RelationInfo = {
        type: Relation.NO_RELATION,
        owner: false,
      };

      matchInfo.opponentScore = opponent.score;
      matchInfo.opponent = UserService.toUserProfileResponse(opponent.user, relation, false);
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
}