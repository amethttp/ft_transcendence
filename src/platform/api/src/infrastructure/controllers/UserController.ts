import { type FastifyRequest, type FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorMsg, ResponseError } from "../../application/errors/ResponseError";

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async getLoggedUser(request: FastifyRequest, reply: FastifyReply) {
    const requestedUser = request.user as JwtPayloadInfo;

    try {
      return reply.send(await this.userService.getByIdShallow(requestedUser.sub));
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorMsg.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async pingUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const user = await this.userService.getByUsername(request.params.username);

      reply.code(200).send(user);
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorMsg.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }
}
