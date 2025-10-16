import { Tournament } from "../../domain/entities/Tournament";
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

  async newTournamentPlayer(user: User, tournament: Tournament, round: number = 0): Promise<TournamentPlayer> {
    const tournamentPlayerBlueprint: Partial<TournamentPlayer> = {
      round: round,
      user: user,
      tournament: tournament
    };

    const id = await this._tournamentPlayerRepository.create(tournamentPlayerBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const tournamentPlayer = await this._tournamentPlayerRepository.findById(id);
    if (tournamentPlayer === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return tournamentPlayer;
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

  async getAllUserTournaments(originUser: User): Promise<Tournament[]> {
    const players = await this._tournamentPlayerRepository.findAllByUser(originUser.id);
    if (players === null)
      return [];
    const tournaments = players.map(player => player.tournament);
  
    return tournaments;
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