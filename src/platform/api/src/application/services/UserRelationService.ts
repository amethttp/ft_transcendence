import { User } from "../../domain/entities/User";
import { UserRelation } from "../../domain/entities/UserRelation";
import { IUserRelationRepository } from "../../domain/repositories/IUserRelationRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { Relation, RelationType } from "../models/RelationType";

export class UserRelationService {
  private _userRelationRepository: IUserRelationRepository;

  constructor(UserRelationRepository: IUserRelationRepository) {
    this._userRelationRepository = UserRelationRepository;
  }

  async getFriendshipStatus(originUser: User, requestedUser: User): Promise<boolean> {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation && relation.type === Relation.FRIENDSHIP_ACCEPTED)
      return true;

    return false;
  }

  async getRelationStatus(originUser: User, requestedUser: User): Promise<RelationType> {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    console.log("Relation", relation);
    if (relation === null)
        return Relation.NO_RELATION;
    
    return relation.type as RelationType;
  }

  async eraseAllUserRelations(user: User) {
    await this._userRelationRepository.deleteAllBySingleUser(user.id);
  }

  async delete(relation: UserRelation) {
    if (!(await this._userRelationRepository.delete(relation.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
