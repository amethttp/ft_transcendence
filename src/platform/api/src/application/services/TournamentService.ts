import { Tournament } from "../../domain/entities/Tournament";
import { ITournamentRepository } from "../../domain/repositories/ITournamentRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";


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
}