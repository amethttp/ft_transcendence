import { TournamentPlayer } from "../../domain/entities/TournamentPlayer";
import { User } from "../../domain/entities/User";
import { ITournamentPlayerRepository } from "../../domain/repositories/ITournamentPlayerRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";


export class TournamentPlayerService {
  private _tournamentPlayerRepository: ITournamentPlayerRepository;

  constructor(tournamentPlayerRepository: ITournamentPlayerRepository) {
    this._tournamentPlayerRepository = tournamentPlayerRepository;
  }

  async getLast10UserTournaments(originUser: User): Promise<TournamentPlayer[]> {
    const tournaments = await this._tournamentPlayerRepository.findLastAmountByUser(originUser.id, 10);
    if (tournaments === null)
      return [] as TournamentPlayer[];

    return tournaments as TournamentPlayer[];
  }

  async getAllUserTournaments(originUser: User): Promise<TournamentPlayer[]> {
    const tournaments = await this._tournamentPlayerRepository.findAllByUser(originUser.id);
    if (tournaments === null)
      return [] as TournamentPlayer[];

    return tournaments as TournamentPlayer[];
  }

  async delete(tournamentPlayer: TournamentPlayer) {
    if (!(await this._tournamentPlayerRepository.delete(tournamentPlayer.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}