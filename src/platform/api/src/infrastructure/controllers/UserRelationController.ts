import { type FastifyRequest, type FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { UserRelationService } from "../../application/services/UserRelationService";

export default class UserRelationController {
  private _userService: UserService;
  private _userRelationService: UserRelationService;

  constructor(userService: UserService, userRelationService: UserRelationService) {
    this._userService = userService;
    this._userRelationService = userRelationService;

  }

  async getUserFriends(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const friendsProfiles = await this._userRelationService.getAllUserFriendsRelationsProfiles(originUser);

      reply.code(200).send(friendsProfiles);
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

  async getUserPendingRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestsProfiles = await this._userRelationService.getAllUserFriendRequestsProfiles(originUser);

      reply.code(200).send(requestsProfiles);
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

  async addFriend(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      await this._userRelationService.sendFriendRequest(originUser, requestedUser);

      reply.code(200).send({ success: true });
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

  async removeFriend(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      await this._userRelationService.removeFriend(originUser, requestedUser);

      reply.code(200).send({ success: true });
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

  async acceptFriendRequest(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      await this._userRelationService.acceptFriendRequest(originUser, requestedUser);

      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async declineFriendRequest(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      await this._userRelationService.declineFriendRequest(originUser, requestedUser);

      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }


  async blockUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      await this._userRelationService.blockUser(originUser, requestedUser);

      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async unblockUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      await this._userRelationService.unblockUser(originUser, requestedUser);

      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }
}
