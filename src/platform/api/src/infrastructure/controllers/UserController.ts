import type { FastifyRequest, FastifyReply } from "fastify";
import { UserRegistrationInfo } from "../../application/models/UserRegistrationInfo";
import { UserService } from "../../application/services/UserService";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export default class UserController {
  private userService: UserService;

  constructor(userRepository: IUserRepository) {
    this.userService = new UserService(userRepository);
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = request.body as UserRegistrationInfo;
      const user = await this.userService.createUser(userData);

      return reply.code(201).send({
        success: true,
        message: "Created",
        data: user,
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: "Bad Request",
      });
    }
  }

  async pingUser(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    return this.userService.getUserByUsername(request.params.username)
      .then(user => reply.code(200).send({
        success: true,
        message: user?.username + ': I\'m alive!',
      }))
      .catch(err => reply.code(404).send({
        success: false,
        error: 'The ping echoed nowhere...: ' + err + ': ' + request.params.username,
      }));
  }
}
