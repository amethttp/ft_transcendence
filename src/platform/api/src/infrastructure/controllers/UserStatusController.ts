import { FastifyReply, FastifyRequest } from "fastify";
import { UserStatusService } from "../../application/services/UserStatusService";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { UserService } from "../../application/services/UserService";
import { StatusType, TStatusType } from "../../application/models/UserStatusDto";
import { UserRelationService } from "../../application/services/UserRelationService";

export default class UserStatusController {
  private _userService: UserService;
  private _userStatusService: UserStatusService;
  private _userRelationService: UserRelationService;

  constructor(userService: UserService, userStatusService: UserStatusService, userRelationService: UserRelationService) {
    this._userService = userService;
    this._userStatusService = userStatusService;
    this._userRelationService = userRelationService;
  }

  async getUserStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const status = await this._userStatusService.getUserConnectionStatus(jwtUser.sub);
      return reply.status(200).send(status);

    } catch (err) {
      if (err instanceof ResponseError) {
        console.log(err);
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async getAllUserFriendsStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(jwtUser.sub);
      const friendsProfiles = await this._userRelationService.getAllUserFriendsRelationsProfiles(user);
      const friendsStatus: Record<string, TStatusType> = {};
      for (const friends of friendsProfiles)
        friendsStatus[friends.username] = friends.status

      reply.code(200).send(friendsStatus);
    } catch (err) {
      if (err instanceof ResponseError) {
        console.log(err);
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async refreshUserStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(jwtUser.sub);
      await this._userStatusService.setUserStatus(user, StatusType.ONLINE)

      return reply.status(200).send({ 'ok': true });
    } catch (err) {
      if (err instanceof ResponseError) {
        console.log(err);
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }
}
