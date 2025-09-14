import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { UserRelation } from "../../../domain/entities/UserRelation";
import { IUserRelationRepository } from "../../../domain/repositories/IUserRelationRepository";

export class SQLiteUserRelationRepository extends SQLiteBaseRepository<UserRelation> implements IUserRelationRepository {

  constructor() {
    super(new UserRelation());
  }

  findAllBySingleUser(id: number): Promise<UserRelation[] | null> {
    const query = `WHERE owner_user_id=? OR receiver_user_id=?`;
    return this.baseFindAll(query, [id, id]);
  }

  deleteAllBySingleUser(id: number): Promise<boolean | null> {
    const query = `WHERE owner_user_id=? OR receiver_user_id=?`;
    return this.baseDelete(query, [id, id]);
  }
}
