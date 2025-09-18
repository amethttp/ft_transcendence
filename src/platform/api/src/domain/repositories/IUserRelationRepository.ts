import { UserRelation } from "../entities/UserRelation";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRelationRepository extends IBaseRepository<UserRelation> {
  findAllBySingleUser(id: number): Promise<UserRelation[] | null>;
  deleteAllBySingleUser(id: number): Promise<boolean | null>;
}
