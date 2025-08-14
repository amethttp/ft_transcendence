import type { FastifyRequest, FastifyReply } from "fastify";
import { UserDto } from "../../application/models/UserDto";
import { UserService } from "../../application/services/UserService";

export default class UserController {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
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
