import { FastifyInstance } from "fastify";
import AuthController from "../controllers/AuthController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "../../application/services/UserService";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { SQLiteUserVerificationRepository } from "../repositories/sqlite/SQLiteUserVerificationRepository";
import { UserVerificationService } from "../../application/services/UserVerificationService";

export default async function authRoutes(server: FastifyInstance) {
  const userRepository = new SQLiteUserRepository();
  const userService = new UserService(userRepository);
  const passwordRepository = new SQLitePasswordRepository();
  const passwordService = new PasswordService(passwordRepository);
  const authRepository = new SQLiteAuthRepository(); 
  const authService = new AuthService(authRepository, userService, passwordService);
  const userVerificationRepository = new SQLiteUserVerificationRepository(); 
  const userVerificationService = new UserVerificationService(userVerificationRepository);
  const authController = new AuthController(authService, userVerificationService);

  server.get('/refresh', async (request, reply) => {
    await authController.refresh(request, reply, server.jwt);
  });

  server.post("/login", async (request, reply) => {
    await authController.login(request, reply);
  });

  server.post("/login/verify", async (request, reply) => {
    await authController.verifyLogin(request, reply);
  });

  server.post("/register", async (request, reply) => {
    await authController.register(request, reply);
  });

  server.delete("/login", async (_request, reply) => {
    await authController.logout(reply);
  });
}
