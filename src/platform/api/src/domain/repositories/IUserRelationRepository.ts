import { UserRelation } from "../entities/UserRelation";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRelationRepository extends IBaseRepository<UserRelation> {
  findByAnyTwoUsers(id1: number, id2: number): Promise<UserRelation | null>;
  findAllBySingleUser(id: number): Promise<UserRelation[] | null>;
  findAllFriendsBySingleUser(id: number): Promise<UserRelation[] | null>;
  findAllFindRequestsBySingleUser(id: number): Promise<UserRelation[] | null>;
  findAllBlockedBySingleUser(id: number): Promise<UserRelation[] | null>;
  deleteAllBySingleUser(id: number): Promise<boolean | null>;
}
