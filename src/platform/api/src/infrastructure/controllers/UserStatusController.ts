import { FastifyReply, FastifyRequest } from "fastify";
import { UserStatusService } from "../../application/services/UserStatusService";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { UserService } from "../../application/services/UserService";
import { Status } from "../../application/models/StatusInfo";

export default class UserStatusController {
  private _userService: UserService;
  private _userStatusService: UserStatusService;

  constructor(userService: UserService, userStatusService: UserStatusService) {
    this._userService = userService;
    this._userStatusService = userStatusService;
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

  async refreshUserStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(jwtUser.sub);
      await this._userStatusService.setUserStatus(user, Status.ONLINE)

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
