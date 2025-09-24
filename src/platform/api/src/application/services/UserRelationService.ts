import { User } from "../../domain/entities/User";
import { UserRelation } from "../../domain/entities/UserRelation";
import { IUserRelationRepository } from "../../domain/repositories/IUserRelationRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { Relation, RelationInfo, RelationType } from "../models/RelationInfo";
import { UserProfileResponse } from "../models/UserProfileResponse";
import { UserService } from "./UserService";
import { UserStatusService } from "./UserStatusService";

export class UserRelationService {
  private _userStatusService: UserStatusService;
  private _userRelationRepository: IUserRelationRepository;

  constructor(userStatusService: UserStatusService, UserRelationRepository: IUserRelationRepository) {
    this._userStatusService = userStatusService;
    this._userRelationRepository = UserRelationRepository;
  }

  async getFriendshipStatus(originUser: User, requestedUser: User): Promise<boolean> {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation && relation.type === Relation.FRIENDSHIP_ACCEPTED)
      return true;

    return false;
  }

  async getRelationInfo(originUser: User, requestedUser: User): Promise<RelationInfo> {
    const res: RelationInfo = { type: Relation.NO_RELATION, owner: false };
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation === null)
      return res;

    return UserRelationService.toRelationInfo(originUser, relation);
  }

  async getAllUserFriendsRelationsProfiles(originUser: User): Promise<UserProfileResponse[]> {
    const relations = await this._userRelationRepository.findAllFriendsBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserProfileResponse[];

    return this.userRelationsToUserProfiles(originUser, relations);
  }

  async getAllUserFriendRequestsProfiles(originUser: User): Promise<UserProfileResponse[]> {
    const relations = await this._userRelationRepository.findAllFindRequestsBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserProfileResponse[];

    return this.userRelationsToUserProfiles(originUser, relations);
  }

  async getAllUserBlockedProfiles(originUser: User): Promise<UserProfileResponse[]> {
    const relations = await this._userRelationRepository.findAllBlockedBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserProfileResponse[];

    return this.userRelationsToUserProfiles(originUser, relations);
  }

  async sendFriendRequest(originUser: User, requestedUser: User) {
    const relationBlueprint: Partial<UserRelation> = {};

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        if (originUser.id === relation.ownerUser.id) { throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION); };
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
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;
    }
  }

  async acceptFriendRequest(originUser: User, requestedUser: User) {
    const relationBlueprint: Partial<UserRelation> = {};

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        if (originUser.id === relation.ownerUser.id) { throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION); };
        relationBlueprint.type = Relation.FRIENDSHIP_ACCEPTED;
        if (!(await this._userRelationRepository.update(relation.id, relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;
    }
  }

  async declineFriendRequest(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case Relation.FRIENDSHIP_ACCEPTED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;

      case Relation.FRIENDSHIP_REQUESTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case Relation.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
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
    if (relation) {
      if (relation.type === Relation.BLOCKED) {
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
      }
      if (!(await this._userRelationRepository.delete(relation.id))) {
        new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      };
    }

    if (!(await this._userRelationRepository.create(relationBlueprint))) {
      new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    };
  }

  async unblockUser(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation && relation.type === Relation.BLOCKED) {
      if (originUser.id === relation.receiverUser.id) {
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
      };
      if (!(await this._userRelationRepository.delete(relation.id))) {
        new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      };
    }
  }

  async eraseAllUserRelations(user: User) {
    await this._userRelationRepository.deleteAllBySingleUser(user.id);
  }

  async delete(relation: UserRelation) {
    if (!(await this._userRelationRepository.delete(relation.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  public static toRelationInfo(originUser: User, relation: UserRelation): RelationInfo {
    const userProfile: RelationInfo = {
      type: relation.type as RelationType,
      owner: (relation.ownerUser.id === originUser.id)
    };

    return userProfile;
  }

  private async userRelationsToUserProfiles(originUser: User, relations: UserRelation[]): Promise<UserProfileResponse[]> {
    const profiles = await Promise.all(
      relations.map(async relation => UserService.toUserProfileResponse(
        relation.ownerUser.id === originUser.id
          ? relation.receiverUser
          : relation.ownerUser,
        UserRelationService.toRelationInfo(originUser, relation),
        relation.type === Relation.BLOCKED ?
          2 :
          (await this._userStatusService.getUserConnectionStatus(relation.receiverUser.id)).value)));

    return profiles;
  }
}
