import { FastifyInstance } from "fastify";
import AuthController from "../controllers/AuthController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "../../application/services/UserService";
import { AuthService } from "../../application/services/AuthService";

export default async function authRoutes(server: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const userService = new UserService(userRepository);
  const authRepository = new SQLiteAuthRepository(); 
  const authService = new AuthService(authRepository);
  const authController = new AuthController(userService, authService);

  server.get('/refresh', async (request, reply) => {
    await authController.refresh(request, reply, server.jwt);
  });

  server.post("/login", async (request, reply) => {
    await authController.login(request, reply);
  });

  server.delete("/login", async (_request, reply) => {
    await authController.logout(reply);
  });
}
