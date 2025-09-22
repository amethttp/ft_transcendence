import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { UserRelation } from "../../../domain/entities/UserRelation";
import { IUserRelationRepository } from "../../../domain/repositories/IUserRelationRepository";

export class SQLiteUserRelationRepository extends SQLiteBaseRepository<UserRelation> implements IUserRelationRepository {

  constructor() {
    super(new UserRelation());
  }

  findByAnyTwoUsers(id1: number, id2: number): Promise<UserRelation | null> {
    const query = `WHERE (owner_user_id=? AND receiver_user_id=?) OR (owner_user_id=? AND receiver_user_id=?)`;
    return this.baseFind(query, [id1, id2, id2, id1]);
  }

  findAllBySingleUser(id: number): Promise<UserRelation[] | null> {
    const query = `WHERE (owner_user_id=? OR receiver_user_id=?)`;
    return this.baseFindAll(query, [id, id]);
  }

  findAllFriendsBySingleUser(id: number): Promise<UserRelation[] | null> {
    const query = `WHERE ((receiver_user_id=? OR owner_user_id=?) AND type=2)`;
    return this.baseFindAll(query, [id, id]);
  }

  findAllFindRequestsBySingleUser(id: number): Promise<UserRelation[] | null> {
    const query = `WHERE (receiver_user_id=? AND type=1)`;
    return this.baseFindAll(query, [id]);
  }

  findAllBlockedBySingleUser(id: number): Promise<UserRelation[] | null> {
    const query = `WHERE (owner_user_id=? AND type=3)`;
    return this.baseFindAll(query, [id]);
  }

  deleteAllBySingleUser(id: number): Promise<boolean | null> {
    const query = `WHERE owner_user_id=? OR receiver_user_id=?`;
    return this.baseDelete(query, [id, id]);
  }
}
