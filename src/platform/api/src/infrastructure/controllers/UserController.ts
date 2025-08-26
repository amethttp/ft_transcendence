import type { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async getLoggedUser(request: FastifyRequest, reply: FastifyReply) {
    const requestedUser = request.user as JwtPayloadInfo;

    return this.userService.getUserById(requestedUser.sub)
      .then(user => {
        return reply.code(200).send(user);
      })
      .catch(() => reply.code(403).send({
        success: false,
        error: "No user logged",
      }));
  }

  async pingUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    const requestedUser = request.user as JwtPayloadInfo;

    return this.userService.getUserByUsername(request.params.username)
      .then(user => {
        if (requestedUser.sub !== user.id) {
          return reply.code(403).send({
            success: false,
            error: request.params.username + ' says: You are not allowed to read my stuff!',
          });
        }

        return reply.code(200).send(user);
      })
      .catch(err => reply.code(404).send({
        success: false,
        error: 'The ping echoed nowhere...: ' + err + ': ' + request.params.username,
      }));
  }
}
