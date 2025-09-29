import SearchController from "../controllers/SearchController";
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
import { SQLiteUserStatusRepository } from "../repositories/sqlite/SQLiteUserStatusRepository";
import { UserStatusService } from "../../application/services/UserStatusService";
import { DownloadDataService } from "../../application/services/DownloadDataService";
import { SQLiteDownloadDataRepository } from "../repositories/sqlite/SQLiteDownloadDataRepository";

export default async function SearchRoutes(server: FastifyInstance) {
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
  const searchController = new SearchController(userService, userController);

  server.get('', async (request: FastifyRequest, reply) => {
    await searchController.searchResults(request, reply);
  });

}
