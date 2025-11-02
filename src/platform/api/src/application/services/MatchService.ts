import { randomBytes } from "crypto";
import { Match } from "../../domain/entities/Match";
import { IMatchRepository } from "../../domain/repositories/IMatchRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { TournamentRound } from "../../domain/entities/TournamentRound";
import StringTime from "../helpers/StringTime";
import { NewMatchRequest } from "../models/NewMatchRequest";
import { MatchMinified } from "../models/MatchMinified";

export class MatchService {
  private _matchRepository: IMatchRepository;

  constructor(matchRepository: IMatchRepository) {
    this._matchRepository = matchRepository;
  }

  async newMatch(request: NewMatchRequest): Promise<Match> {
    const matchBlueprint: Partial<Match> = {
      ...request,
      token: randomBytes(8).toString("base64url"),
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

  async setMatchFinished(match: Match) {
    const matchUpdate: Partial<Match> = {
      state: 3,
      finishTime: StringTime.now(),
    };

    const update = await this._matchRepository.update(match.id, matchUpdate);
    if (!update)
      throw new ResponseError(ErrorParams.USER_NOT_FOUND);
  }

  async getByToken(token: string): Promise<Match | null> {
    const _match = await this._matchRepository.findByToken(token);
    return _match;
  }

  async newLocalMatch(name: string): Promise<Match> {
    const matchBlueprint: Partial<Match> = {
      name: name,
      token: randomBytes(32).toString("base64url"), // TODO: here or on controller??
      isVisible: false,
      state: 1,
      finishTime: StringTime.now() // TODO: erase
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

  async getPublic(): Promise<MatchMinified[]> {
    const matches = await this._matchRepository.getPublic(Object.keys(new MatchMinified()));
    if (!matches) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    else {
      return matches;
    }
  }
}