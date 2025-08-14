import type { FastifyRequest, FastifyReply } from "fastify";
import { UserDto } from "../../application/models/UserDto";
import { UserService } from "../../application/services/UserService";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

type pingUserRequest = { Params: { userId: string } };

export default class UserController {
  private userService: UserService;

  constructor(userRepository: IUserRepository) {
    this.userService = new UserService(userRepository);
  }

  static pingUser(request: FastifyRequest<pingUserRequest>, reply: FastifyReply) {
    const userId = request.params.userId;
    console.log('User ID:', userId);
    reply.status(200).send(userId + ': ping!\nServer: pong!');
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = request.body as UserDto;
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

  async test(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("INTO TEST");
      console.log("CONTR RES:", await this.userService.test());

      return reply.code(201).send({
        success: true,
        message: "Created",
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: "Bad Request",
      });
    }
  }
}
