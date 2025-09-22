import { randomInt } from "crypto";
import { Match } from "../../domain/entities/Match";
import { MatchPlayer } from "../../domain/entities/MatchPlayer";
import { User } from "../../domain/entities/User";
import { IMatchPlayerRepository } from "../../domain/repositories/IMatchPlayerRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { MatchInfo } from "../models/MatchInfo";
import { UserProfileResponse } from "../models/UserProfileResponse";

export class MatchPlayerService {
  private _matchPlayerRepository: IMatchPlayerRepository;

  constructor(matchPlayerRepository: IMatchPlayerRepository) {
    this._matchPlayerRepository = matchPlayerRepository;
  }

  async newMatchPlayer(user: User, match: Match): Promise<MatchPlayer> {
    const matchPlayerBlueprint: Partial<MatchPlayer> = {
      score: randomInt(5),
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

  async getLast10UserMatches(originUser: User): Promise<MatchInfo[]> {
    const matches = await this._matchPlayerRepository.findLastAmountByUser(originUser.id, 10);
    if (matches === null)
      return [] as MatchInfo[];

    const matchesInfo = matches.map(match => this.toMatchInfo(match));
    return matchesInfo;
  }

  async getAllUserMatchesInfo(originUser: User): Promise<MatchInfo[]> {
    const matches = await this._matchPlayerRepository.findAllByUser(originUser.id);
    if (matches === null)
      return [] as MatchInfo[];

    const matchesInfo = matches.map(match => this.toMatchInfo(match));
    return matchesInfo;
  }

  async delete(matchPlayer: MatchPlayer) {
    if (!(await this._matchPlayerRepository.delete(matchPlayer.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  public toMatchInfo(mPlayer: MatchPlayer): MatchInfo {
    const matchInfo: MatchInfo = {
      name: mPlayer.match.name,
      state: mPlayer.match.state,
      score: mPlayer.score,
      opponentScore: randomInt(5), // TODO: WIP
      opponent: mPlayer.user as any as UserProfileResponse, // TODO: WIP
      isWinner: mPlayer.isWinner,
      finishTime: mPlayer.match.finishTime || "Aborted"
    }

    return matchInfo;
  }
}