import type { FastifyRequest, FastifyReply } from 'fastify';
import type { UserDto } from '../services/dtos/user_dto.js';
import { UserService } from '../services/user_service.js';

export class UserController {
  constructor(private userService: UserService) { }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('AMETHHHH');
      const userData = request.body as UserDto;
      const user = await this.userService.createUser(userData);

      return reply.code(201).send({
        success: true,
        message: 'Created',
        data: user
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request'
      });
    }
  }
}