import { TournamentMinified } from "../../application/models/TournamentMinified";
import { Tournament, tournamentSchema } from "../entities/Tournament";
import { IBaseRepository } from "./IBaseRepository";

export interface ITournamentRepository extends IBaseRepository<Tournament> {
  findPublic(attributes?: (keyof typeof tournamentSchema)[]): Promise<TournamentMinified[] | null>;
  findByToken(token: string): Promise<Tournament | null>;
}
