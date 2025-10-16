import { randomBytes } from "crypto";
import { Tournament, TournamentState } from "../../domain/entities/Tournament";
import { ITournamentRepository } from "../../domain/repositories/ITournamentRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { NewTournamentRequest } from "../models/NewTournamentRequest";
import { TournamentMinified } from "../models/TournamentMinified";


export class TournamentService {
  private _tournamentRepository: ITournamentRepository;

  constructor(tournamentRepository: ITournamentRepository) {
    this._tournamentRepository = tournamentRepository;
  }

  async newPrivateTournament(name: string, token: string, playersAmount: number): Promise<Tournament> {
    const tournamentBlueprint: Partial<Tournament> = {
      name: name,
      token: token,
      round: 0,
      isVisible: false,
      playersAmount: playersAmount,
      state: 1,
    };

    const id = await this._tournamentRepository.create(tournamentBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const Tournament = await this._tournamentRepository.findById(id);
    if (Tournament === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return Tournament;
  }

  async newPublicTournament(name: string, token: string, playersAmount: number): Promise<Tournament> {
    const tournamentBlueprint: Partial<Tournament> = {
      name: name,
      token: token,
      round: 0,
      isVisible: true,
      playersAmount: playersAmount,
      state: 1,
    };

    const id = await this._tournamentRepository.create(tournamentBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const Tournament = await this._tournamentRepository.findById(id);
    if (Tournament === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return Tournament;
  }

  async delete(tournament: Tournament) {
    if (!(await this._tournamentRepository.delete(tournament.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  async newTournament(request: NewTournamentRequest): Promise<Tournament> {
    const tournamentBlueprint: Partial<Tournament> = {
      name: request.name,
      token: randomBytes(8).toString("base64url"),
      round: 0,
      isVisible: request.isVisible,
      playersAmount: request.playersAmount,
      state: 1,
      points: request.points
    };

    const id = await this._tournamentRepository.create(tournamentBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    const tournament = await this._tournamentRepository.findById(id);
    if (tournament === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return tournament;
  }

  async getList(): Promise<TournamentMinified[]> {
    const tournaments = await this._tournamentRepository.findPublic(Object.keys(new TournamentMinified()));
    if (!tournaments)
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    return tournaments;
  }

  async getByToken(token: string): Promise<Tournament> {
    const tournament = await this._tournamentRepository.findByToken(token);
    if (!tournament)
      throw new ResponseError(ErrorParams.NOT_FOUND);
    return tournament;
  }

  async start(tournament: Tournament): Promise<number> {
    tournament.state = TournamentState.IN_PROGRESS;
    const blueprint: Partial<Tournament> = {
      state: TournamentState.IN_PROGRESS,
    };
    Object.assign(tournament, blueprint);
    const res = await this._tournamentRepository.update(tournament.id, blueprint);
    if (res === null)
      throw new ResponseError(ErrorParams.UPDATE_ERROR);
    return res;
  }
}