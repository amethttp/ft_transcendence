import { FastifyInstance, FastifyRequest } from "fastify";
import UserController from "../controllers/UserController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";

const userRepository = new SQLiteUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

async function userRoutes(server: FastifyInstance) {
  server.get('/ping/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userController.pingUser(request, reply);
  });

  server.post("/login", async (request, reply) => {
    await userController.login(request, reply);
  });
}

export default userRoutes;
