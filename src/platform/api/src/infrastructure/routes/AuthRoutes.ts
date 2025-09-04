import { FastifyInstance } from "fastify";
import AuthController from "../controllers/AuthController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "../../application/services/UserService";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";

export default async function authRoutes(server: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const userService = new UserService(userRepository);
  const passwordRepository = new SQLitePasswordRepository;
  const passwordService = new PasswordService(passwordRepository);
  const authRepository = new SQLiteAuthRepository(); 
  const authService = new AuthService(authRepository, userService, passwordService);
  const authController = new AuthController(authService);

  server.get('/refresh', async (request, reply) => {
    await authController.refresh(request, reply, server.jwt);
  });

  server.post("/login", async (request, reply) => {
    await authController.login(request, reply);
  });

  server.post("/register", async (request, reply) => {
    await authController.register(request, reply);
  });

  server.delete("/login", async (_request, reply) => {
    await authController.logout(reply);
  });
}
