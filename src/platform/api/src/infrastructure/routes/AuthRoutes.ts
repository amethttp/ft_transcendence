import { FastifyInstance, FastifyRequest } from "fastify";
import AuthController from "../controllers/AuthController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "../../application/services/UserService";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { SQLiteUserVerificationRepository } from "../repositories/sqlite/SQLiteUserVerificationRepository";
import { UserVerificationService } from "../../application/services/UserVerificationService";
import { SQLiteRecoverPasswordRepository } from "../repositories/sqlite/SQLiteRecoverPasswordRepository";
import { RecoverPasswordService } from "../../application/services/RecoverPasswordService";
import fastifyRateLimit from "@fastify/rate-limit";
import { GoogleAuthService } from "../../application/services/googleAuthService";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";

export default async function authRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userVerificationRepository = new SQLiteUserVerificationRepository();
  const recoverPasswordRepository = new SQLiteRecoverPasswordRepository();
  const userRepository = new SQLiteUserRepository();
  const passwordService = new PasswordService(passwordRepository);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const authService = new AuthService(authRepository, passwordService);
  const userVerificationService = new UserVerificationService(userVerificationRepository);
  const recoverPasswordService = new RecoverPasswordService(recoverPasswordRepository);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const authController = new AuthController(authService, passwordService, recoverPasswordService, userService, userVerificationService);

  await server.register(fastifyRateLimit, {
    max: 25,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip + req.headers['user-agent'] || 'unknown'
  });

  server.get('/refresh', async (request, reply) => {
    await authController.refresh(request, reply, server.jwt);
  });

  server.post("/login", async (request, reply) => {
    await authController.login(request, reply);
  });

  server.post("/login/verify", async (request, reply) => {
    await authController.verifyLogin(request, reply);
  });

  server.post("/recover", async (request, reply) => {
    await authController.recoveryEmail(request, reply);
  });

  server.get("/recover/:token", async (request: FastifyRequest<{ Params: { token: string } }>, reply) => {
    await authController.checkRecoverToken(request, reply);
  });

  server.post("/recover/:token", async (request: FastifyRequest<{ Params: { token: string } }>, reply) => {
    await authController.recoverPassword(request, reply);
  });

  server.post("/register", async (request, reply) => {
    await authController.register(request, reply);
  });

  server.delete("/login", async (_request, reply) => {
    await authController.logout(reply);
  });
}
