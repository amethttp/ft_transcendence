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
import { GoogleAuthService } from "../../application/services/GoogleAuthService";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { SQLiteUserStatusRepository } from "../repositories/sqlite/SQLiteUserStatusRepository";
import { UserStatusService } from "../../application/services/UserStatusService";

export default async function authRoutes(server: FastifyInstance) {
  const userStatusRepository = new SQLiteUserStatusRepository();
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userVerificationRepository = new SQLiteUserVerificationRepository();
  const recoverPasswordRepository = new SQLiteRecoverPasswordRepository();
  const userRepository = new SQLiteUserRepository();
  const userStatusService = new UserStatusService(userStatusRepository);
  const authService = new AuthService(authRepository);
  const passwordService = new PasswordService(passwordRepository, authService);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const userVerificationService = new UserVerificationService(userVerificationRepository);
  const recoverPasswordService = new RecoverPasswordService(recoverPasswordRepository);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const authController = new AuthController(authService, passwordService, recoverPasswordService, userService, userVerificationService, userStatusService);

  await server.register(fastifyRateLimit, {
    max: 25,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip + req.headers['user-agent'] || 'unknown'
  });

  server.get('/access/refresh', async (request, reply) => {
    await authController.accessRefresh(request, reply, server.jwt);
  });

  server.get('/refresh', async (request, reply) => {
    await authController.refresh(request, reply, server.jwt);
  });

  server.post("/login", async (request, reply) => {
    await authController.login(request, reply);
  });

  server.get("/google/url", async (request, reply) => {
    await authController.getGoogleAuthUrl(request, reply);
  });

  server.post("/google/callback", async (request, reply) => {
    await authController.authenticateWithGoogle(request, reply);
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

  server.post("/logout", async (request, reply) => {
    await authController.logout(request, reply);
  });
}
