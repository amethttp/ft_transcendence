import { FastifyInstance } from "fastify";
import AuthController from "../controllers/AuthController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";

export default async function authRoutes(server: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const userService = new UserService(userRepository);
  const authController = new AuthController(userService);

  server.get('/refresh', async (request, reply) => {
    await authController.refresh(request, reply, server.jwt);
  });

  server.post("/login", async (request, reply) => {
    await authController.login(request, reply);
  });
}
