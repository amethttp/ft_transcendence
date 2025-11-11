import { randomBytes } from "crypto";
import { Tournament } from "../../domain/entities/Tournament";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { ITournamentRoundRepository } from "../../domain/repositories/ITournamentRoundRepository";
import { TournamentRound } from "../../domain/entities/TournamentRound";


export class TournamentRoundService {
  private _tournamentRoundRepository: ITournamentRoundRepository;

  constructor(tournamentRepository: ITournamentRoundRepository) {
    this._tournamentRoundRepository = tournamentRepository;
  }

  async create(top: string, tournament: Tournament): Promise<TournamentRound> {
    const tournamentBlueprint: Partial<TournamentRound> = {
      top: top,
      token: randomBytes(8).toString("base64url"),
      tournament: tournament,
    };

    const id = await this._tournamentRoundRepository.create(tournamentBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const Tournament = await this._tournamentRoundRepository.findById(id);
    if (Tournament === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return Tournament;
  }
}