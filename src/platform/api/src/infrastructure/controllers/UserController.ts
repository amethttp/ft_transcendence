import { type FastifyRequest, type FastifyReply, errorCodes } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorMsg, ResponseError } from "../../application/errors/ResponseError";

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async pingUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const requestedUser = request.user as JwtPayloadInfo;
      const user = await this.userService.getUserByUsername(request.params.username);

      if (requestedUser.username !== request.params.username) {
        return reply.code(401).send({ error: ErrorMsg.UNAUTHORIZED_USER_ACTION });
      }

      reply.code(200).send({
        data: user
      });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send({ error: err.message });
      }
      else {
        reply.code(500).send({ error: ErrorMsg.UNKNOWN_SERVER_ERROR })
      }
    }
  }
}
