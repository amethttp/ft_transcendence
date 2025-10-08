import { Match, matchSchema } from "../entities/Match";
import { IBaseRepository } from "./IBaseRepository";

export interface IMatchRepository extends IBaseRepository<Match> {
  getPublic(attributes?: (keyof typeof matchSchema)[]): Promise<Match[] | null>;
}
