import { User } from "../../domain/entities/User";
import { UserRelation } from "../../domain/entities/UserRelation";
import { IUserRelationRepository } from "../../domain/repositories/IUserRelationRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { RelationType, Relation, TRelationType } from "../models/Relation";
import { UserProfile } from "../models/UserProfile";
import { StatusType } from "../models/UserStatusDto";
import { UserService } from "./UserService";
import { UserStatusService } from "./UserStatusService";

export class UserRelationService {
  private _userStatusService: UserStatusService;
  private _userRelationRepository: IUserRelationRepository;

  constructor(userStatusService: UserStatusService, userRelationRepository: IUserRelationRepository) {
    this._userStatusService = userStatusService;
    this._userRelationRepository = userRelationRepository;
  }

  async getFriendshipStatus(originUser: User, requestedUser: User): Promise<boolean> {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation && relation.type === RelationType.FRIENDSHIP_ACCEPTED)
      return true;

    return false;
  }

  async getRelation(originUser: User, requestedUser: User): Promise<Relation> {
    const res: Relation = { type: RelationType.NO_RELATION, owner: false, updateTime: "" };
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation === null)
      return res;

    return UserRelationService.toRelation(originUser, relation);
  }

  async getAllUserFriendsRelationsProfiles(originUser: User): Promise<UserProfile[]> {
    const relations = await this._userRelationRepository.findAllFriendsBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserProfile[];

    return this.userRelationsToUserProfiles(originUser, relations);
  }

  async getAllUserFriendRequestsProfiles(originUser: User): Promise<UserProfile[]> {
    const relations = await this._userRelationRepository.findAllFindRequestsBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserProfile[];

    return this.userRelationsToUserProfiles(originUser, relations);
  }

  async getAllUserBlockedProfiles(originUser: User): Promise<UserProfile[]> {
    const relations = await this._userRelationRepository.findAllBlockedBySingleUser(originUser.id);
    if (relations === null)
      return [] as UserProfile[];

    return this.userRelationsToUserProfiles(originUser, relations);
  }

  async sendFriendRequest(originUser: User, requestedUser: User) {
    const relationBlueprint: Partial<UserRelation> = {};

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case RelationType.FRIENDSHIP_ACCEPTED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;

      case RelationType.FRIENDSHIP_REQUESTED:
        if (originUser.id === relation.ownerUser.id) { throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION); };
        relationBlueprint.type = RelationType.FRIENDSHIP_ACCEPTED;
        if (!(await this._userRelationRepository.update(relation.id, relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case RelationType.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        relationBlueprint.ownerUser = originUser;
        relationBlueprint.receiverUser = requestedUser;
        relationBlueprint.type = RelationType.FRIENDSHIP_REQUESTED;
        if (!(await this._userRelationRepository.create(relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;
    }
  }

  async removeFriend(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case RelationType.FRIENDSHIP_ACCEPTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case RelationType.FRIENDSHIP_REQUESTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case RelationType.BLOCKED:
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
      case RelationType.FRIENDSHIP_ACCEPTED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;

      case RelationType.FRIENDSHIP_REQUESTED:
        if (originUser.id === relation.ownerUser.id) { throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION); };
        relationBlueprint.type = RelationType.FRIENDSHIP_ACCEPTED;
        if (!(await this._userRelationRepository.update(relation.id, relationBlueprint))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case RelationType.BLOCKED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);

      default:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;
    }
  }

  async declineFriendRequest(originUser: User, requestedUser: User) {
    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    switch (relation?.type) {
      case RelationType.FRIENDSHIP_ACCEPTED:
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        break;

      case RelationType.FRIENDSHIP_REQUESTED:
        if (!(await this._userRelationRepository.delete(relation.id))) { new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR); };
        break;

      case RelationType.BLOCKED:
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
      type: RelationType.BLOCKED,
    };

    const relation = await this._userRelationRepository.findByAnyTwoUsers(originUser.id, requestedUser.id);
    if (relation) {
      if (relation.type === RelationType.BLOCKED) {
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
    if (relation && relation.type === RelationType.BLOCKED) {
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

  public static toRelation(originUser: User, relation: UserRelation): Relation {
    const userProfile: Relation = {
      type: relation.type as TRelationType,
      owner: (relation.ownerUser.id === originUser.id),
      updateTime: relation.updateTime
    };

    return userProfile;
  }

  private async userRelationsToUserProfiles(originUser: User, relations: UserRelation[]): Promise<UserProfile[]> {
    const profiles = await Promise.all(
      relations.map(async relation => UserService.toUserProfile(
        relation.ownerUser.id === originUser.id
          ? relation.receiverUser
          : relation.ownerUser,
        UserRelationService.toRelation(originUser, relation),
        relation.type === RelationType.BLOCKED
          ? StatusType.OFFLINE
          : (await this._userStatusService.getUserConnectionStatus(
            relation.ownerUser.id === originUser.id
              ? relation.receiverUser.id
              : relation.ownerUser.id
          )).value)));

    return profiles;
  }
}
