import { User } from "../../domain/entities/User";
import { UserRelation } from "../../domain/entities/UserRelation";
import { IUserRelationRepository } from "../../domain/repositories/IUserRelationRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { Relation, RelationInfo, RelationType } from "../models/RelationInfo";

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

  async getRelationStatus(originUser: User, requestedUser: User): Promise<RelationInfo> {
    const res: RelationInfo = { type: Relation.NO_RELATION, owner: false };
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation === null)
      return res;

    res.type = relation.type as RelationType;
    res.owner = (relation.ownerUser === originUser);
    return res;
  }

  async getAllUserRelations(originUser: User): Promise<UserRelation[]> {
    const relations = await this._userRelationRepository.findAllFriendsBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserRelation[];

    return relations as UserRelation[];
  }

  async getAllUserFriendRequests(originUser: User): Promise<UserRelation[]> {
    const relations = await this._userRelationRepository.findAllFindRequestsBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserRelation[];

    return relations as UserRelation[];
  }

  async sendFriendRequest(originUser: User, requestedUser: User) {
    const relationBlueprint: Partial<UserRelation> = {};

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        relationBlueprint.type = Relation.FRIENDSHIP_ACCEPTED;
        if (!(await this._userRelationRepository.update(relation.id, relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        relationBlueprint.ownerUser = originUser;
        relationBlueprint.receiverUser = requestedUser;
        relationBlueprint.type = Relation.FRIENDSHIP_REQUESTED;
        if (!(await this._userRelationRepository.create(relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;
    }
  }

  async removeFriend(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        break;
    }
  }

  async acceptFriendRequest(originUser: User, requestedUser: User) {
    const relationBlueprint: Partial<UserRelation> = {};

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        relationBlueprint.type = Relation.FRIENDSHIP_ACCEPTED;
        if (!(await this._userRelationRepository.update(relation.id, relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        break;
    }
  }

  async declineFriendRequest(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        break;
    }
  }

  async blockUser(originUser: User, requestedUser: User) {
    const relationBlueprint: Partial<UserRelation> = {
      ownerUser: originUser,
      receiverUser: requestedUser,
      type: Relation.BLOCKED,
    };

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation)
      if (!(await this._userRelationRepository.delete(relation.id))) {
        new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      };

    if (!(await this._userRelationRepository.create(relationBlueprint))) {
      new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    };
  }

  async unblockUser(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation && relation.type === Relation.BLOCKED)
      if (!(await this._userRelationRepository.delete(relation.id))) {
        new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      };
  }

  async eraseAllUserRelations(user: User) {
    await this._userRelationRepository.deleteAllBySingleUser(user.id);
  }

  async delete(relation: UserRelation) {
    if (!(await this._userRelationRepository.delete(relation.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  public toRelationInfo(originUser: User, relation: UserRelation): RelationInfo {
    const userProfile: RelationInfo = {
      type: relation.type as RelationType,
      owner: (relation.ownerUser === originUser)
    };

    return userProfile;
  }
}
