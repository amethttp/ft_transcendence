import { FastifyInstance, FastifyRequest } from "fastify";
import UserController from "../controllers/UserController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";

const userRepository = new SQLiteUserRepository();
const userController = new UserController(userRepository);

async function userRoutes(server: FastifyInstance) {
  server.get('/ping/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userController.pingUser(request, reply);
  });

  server.post("/user", async (request, reply) => {
    await userController.register(request, reply);
  });
}

export default userRoutes;
