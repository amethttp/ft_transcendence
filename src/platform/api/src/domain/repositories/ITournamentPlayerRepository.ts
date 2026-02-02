import { TournamentPlayer } from "../entities/TournamentPlayer";
import { IBaseRepository } from "./IBaseRepository";

export interface ITournamentPlayerRepository extends IBaseRepository<TournamentPlayer> {
  findLastAmountByUser(id: number, amount: number): Promise<TournamentPlayer[] | null>;
  findAllByUser(id: number): Promise<TournamentPlayer[] | null>;
  deleteAllByUser(id: number): Promise<boolean | null>;
}
