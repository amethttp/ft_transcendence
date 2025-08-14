import { FastifyInstance, FastifyRequest } from "fastify";
import UserController from "../controllers/UserController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";

async function userRoutes(server: FastifyInstance) {
  server.get('/ping/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    const userRepository = new SQLiteUserRepository();
    const userController = new UserController(userRepository);

    await userController.pingUser(request, reply);

    return 'OK!';
  });

  server.post("/user", (request, reply) => {
    const userRepository = new SQLiteUserRepository();
    const userController = new UserController(userRepository);
    userController.register(request, reply);
    return "pong\n";
  });
}

export default userRoutes;
