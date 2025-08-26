import { FastifyInstance, FastifyRequest } from "fastify";
import UserController from "../controllers/UserController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";

export default async function userRoutes(server: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  server.get('', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userController.getLoggedUser(request, reply);
  });

  server.get('/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userController.pingUser(request, reply);
  });
}
