import { TournamentPlayer } from "../../domain/entities/TournamentPlayer";
import { User } from "../../domain/entities/User";
import { ITournamentPlayerRepository } from "../../domain/repositories/ITournamentPlayerRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { TournamentInfo } from "../models/TournamentInfo";


export class TournamentPlayerService {
  private _tournamentPlayerRepository: ITournamentPlayerRepository;

  constructor(tournamentPlayerRepository: ITournamentPlayerRepository) {
    this._tournamentPlayerRepository = tournamentPlayerRepository;
  }

  async getLast10UserTournamentsInfo(originUser: User): Promise<TournamentInfo[]> {
    const tournaments = await this._tournamentPlayerRepository.findLastAmountByUser(originUser.id, 10);
    if (tournaments === null)
      return [] as TournamentInfo[];
    const tournamentsInfo = tournaments.map(tournament => this.toTournamentInfo(tournament));

    return tournamentsInfo;
  }

  async getAllUserTournamentsInfo(originUser: User): Promise<TournamentInfo[]> {
    const tournaments = await this._tournamentPlayerRepository.findAllByUser(originUser.id);
    if (tournaments === null)
      return [] as TournamentInfo[];
    const tournamentsInfo = tournaments.map(tournament => this.toTournamentInfo(tournament));

    return tournamentsInfo;
  }

  async delete(tournamentPlayer: TournamentPlayer) {
    if (!(await this._tournamentPlayerRepository.delete(tournamentPlayer.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  public toTournamentInfo(tPlayer: TournamentPlayer): TournamentInfo {
    const tournamentInfo: TournamentInfo = {
      name: tPlayer.tournament.name,
      placement: tPlayer.round,
      playerAmount: tPlayer.tournament.playersAmount,
      state: tPlayer.tournament.state,
      finishTime: tPlayer.tournament.finishTime || "Aborted"
    }

    return tournamentInfo;
  }

  public calculateAvgPlacement(tournaments: TournamentInfo[]): number {
    let placement = 0;
    for (const tournament of tournaments) {
      placement += tournament.placement;
    }

    return (placement / tournaments.length);
  }
}