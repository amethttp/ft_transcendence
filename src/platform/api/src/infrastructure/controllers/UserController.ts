import type { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { UserLoginInfo } from "../../application/models/UserLoginInfo";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async pingUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    const requestedUser = request.user as JwtPayloadInfo;

    return this.userService.getUserByUsername(request.params.username)
      .then(user => {
        if (requestedUser.username !== request.params.username) {
          return reply.code(403).send({
              success: false,
              error: request.params.username + ' says: You are not allowed to read my stuff!',
            });
        }

        return reply.code(200).send({
            success: true,
            data: user
          });
      })
      .catch(err => reply.code(404).send({
        success: false,
        error: 'The ping echoed nowhere...: ' + err + ': ' + request.params.username,
      }));
  }
}
