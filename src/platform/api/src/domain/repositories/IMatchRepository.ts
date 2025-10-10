import { Match, matchSchema } from "../entities/Match";
import { IBaseRepository } from "./IBaseRepository";

export interface IMatchRepository extends IBaseRepository<Match> {
  findByToken(token: string): Promise<Match | null>;
  getPublic(attributes?: (keyof typeof matchSchema)[]): Promise<Match[] | null>;
}
