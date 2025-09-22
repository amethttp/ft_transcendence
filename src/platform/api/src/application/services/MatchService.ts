import { randomBytes } from "crypto";
import { Match } from "../../domain/entities/Match";
import { IMatchRepository } from "../../domain/repositories/IMatchRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { TournamentRound } from "../../domain/entities/TournamentRound";

export class MatchService {
  private _matchRepository: IMatchRepository;

  constructor(matchRepository: IMatchRepository) {
    this._matchRepository = matchRepository;
  }

  async newLocalMatch(name: string): Promise<Match> {
    const matchBlueprint: Partial<Match> = {
      name: name,
      token: randomBytes(32).toString("base64url"), // TODO: here or on controller??
      type: 1,
      isVisible: false,
      state: 1
    };

    const id = await this._matchRepository.create(matchBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const match = await this._matchRepository.findById(id);
    if (match === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return match;
  }

  async newRemotePrivateMatch(name: string): Promise<Match> {
    const matchBlueprint: Partial<Match> = {
      name: name,
      token: randomBytes(32).toString("base64url"),
      type: 2,
      isVisible: false,
      state: 1
    };

    const id = await this._matchRepository.create(matchBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const match = await this._matchRepository.findById(id);
    if (match === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return match;
  }

  async newRemotePublicMatch(name: string): Promise<Match> {
    const matchBlueprint: Partial<Match> = {
      name: name,
      token: randomBytes(32).toString("base64url"),
      type: 2,
      isVisible: true,
      state: 1
    };

    const id = await this._matchRepository.create(matchBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const match = await this._matchRepository.findById(id);
    if (match === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return match;
  }

  async newTournamentMatch(name: string, round: TournamentRound): Promise<Match> {
    const matchBlueprint: Partial<Match> = {
      name: name,
      token: randomBytes(32).toString("base64url"),
      type: 3,
      isVisible: false,
      state: 1,
      tournamentRound: round
    };

    const id = await this._matchRepository.create(matchBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const match = await this._matchRepository.findById(id);
    if (match === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return match;
  }

  async delete(match: Match) {
    if (!(await this._matchRepository.delete(match.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}