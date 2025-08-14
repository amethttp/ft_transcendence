import { Tournament } from "../entities/Tournament";
import { IBaseRepository } from "./IBaseRepository";

export interface ITournamentRepository extends IBaseRepository<Tournament> {
  //* specific entity methods here *//
}