import { MatchPlayer } from "../entities/MatchPlayer";
import { IBaseRepository } from "./IBaseRepository";

export interface IMatchPlayerRepository extends IBaseRepository<MatchPlayer> {
  findLastAmountByUser(id: number, amount: number): Promise<MatchPlayer[] | null>;
  findAllUserMatchesInfo(id: number): Promise<MatchPlayer[] | null>;
  findAllByUser(id: number): Promise<MatchPlayer[] | null>;
  findAllByMatch(id: number): Promise<MatchPlayer[] | null>;
  deleteAllByUser(id: number): Promise<boolean | null>;
}
