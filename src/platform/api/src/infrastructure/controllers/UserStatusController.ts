import { FastifyReply, FastifyRequest } from "fastify";
import { UserStatusService } from "../../application/services/UserStatusService";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";

export default class UserStatusController {
  private _userStatusService: UserStatusService;

  constructor(userStatusService: UserStatusService) {
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
}
