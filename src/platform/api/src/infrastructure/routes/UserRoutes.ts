import { FastifyInstance, FastifyRequest } from "fastify";
import UserController from "../controllers/UserController";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { GoogleAuthService } from "../../application/services/googleAuthService";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { SQLiteUserVerificationRepository } from "../repositories/sqlite/SQLiteUserVerificationRepository";
import { SQLiteUserRelationRepository } from "../repositories/sqlite/SQLiteUserRelationRepository";
import { SQLiteRecoverPasswordRepository } from "../repositories/sqlite/SQLiteRecoverPasswordRepository";
import { UserVerificationService } from "../../application/services/UserVerificationService";
import { UserRelationService } from "../../application/services/UserRelationService";
import { RecoverPasswordService } from "../../application/services/RecoverPasswordService";
import fastifyMultipart from "@fastify/multipart";
import { SQLiteUserStatusRepository } from "../repositories/sqlite/SQLiteUserStatusRepository";
import { UserStatusService } from "../../application/services/UserStatusService";
import { DownloadDataService } from "../../application/services/DownloadDataService";
import { SQLiteDownloadDataRepository } from "../repositories/sqlite/SQLiteDownloadDataRepository";

export default async function userRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userRepository = new SQLiteUserRepository();
  const userVerificationRepository = new SQLiteUserVerificationRepository();
  const userRelationRepository = new SQLiteUserRelationRepository();
  const recoverPasswordRepository = new SQLiteRecoverPasswordRepository();
  const userStatusRepository = new SQLiteUserStatusRepository();
  const userVerificationService = new UserVerificationService(userVerificationRepository);
  const userStatusService = new UserStatusService(userStatusRepository);
  const userRelationService = new UserRelationService(userStatusService, userRelationRepository);
  const recoverPasswordService = new RecoverPasswordService(recoverPasswordRepository);
  const passwordService = new PasswordService(passwordRepository);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const authService = new AuthService(authRepository, passwordService);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const downloadDataRepository = new SQLiteDownloadDataRepository();
  const downloadDataService = new DownloadDataService(downloadDataRepository);
  const userController = new UserController(userService, userVerificationService, userRelationService, recoverPasswordService, userStatusService, downloadDataService);

  server.get('', async (request: FastifyRequest, reply) => {
    await userController.getLoggedUser(request, reply);
  });

  server.get('/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userController.getUserProfile(request, reply);
  });

  server.get('/check/username/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userController.checkUsername(request, reply);
  });

  server.get('/check/email/:email', async (request: FastifyRequest<{ Params: { email: string } }>, reply) => {
    await userController.checkEmail(request, reply);
  });

  server.put('', async (request: FastifyRequest, reply) => {
    await userController.updateUser(request, reply);
  });

  server.delete('', async (request: FastifyRequest, reply) => {
    await userController.eraseAccount(request, reply);
  });

  server.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    }
  });
  server.post('/avatar', async (request, reply) => await userController.uploadAvatar(request, reply));

  server.get('/download/:token', async (request: FastifyRequest<{ Params: { token: string } }>, reply) => {
    await userController.downloadData(request, reply);
  });

  server.get('/download', async (request, reply) => {
    await userController.requestDownloadData(request, reply);
  });
}
