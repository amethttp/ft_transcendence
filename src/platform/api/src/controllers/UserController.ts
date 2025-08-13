import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserDto } from "../services/UserService/models/UserDto";
import { UserService } from "../services/UserService/UserService";

type pingUserRequest = { Params: { userId: string } };

export default class UserController {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  static pingUser(request: FastifyRequest<pingUserRequest>, reply: FastifyReply) {
    const userId = request.params.userId;
    console.log('User ID:', userId);
    reply.status(200).send(userId + ': ping!\nServer: pong!');
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("AMETHHHH");
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
}
