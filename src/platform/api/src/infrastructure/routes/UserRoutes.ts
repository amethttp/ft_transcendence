import { FastifyInstance } from "fastify";
import UserController from "../controllers/UserController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";

async function userRoutes(server: FastifyInstance) {
  server.get('/test', async (request, reply) => {
    const userRepository = new SQLiteUserRepository();
    const userController = new UserController(userRepository);

    await userController.test(request, reply);

    return 'OK!';
  });

  server.get('/user/:userId', UserController.pingUser);

  server.post("/user", (request, reply) => {
    const userRepository = new SQLiteUserRepository();
    const userController = new UserController(userRepository);
    userController.register(request, reply);
    return "pong\n";
  });
}

export default userRoutes;
