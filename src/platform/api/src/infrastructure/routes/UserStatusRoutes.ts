import { FastifyInstance, FastifyRequest } from "fastify";
import UserStatusController from "../controllers/UserStatusController";
import { UserStatusService } from "../../application/services/UserStatusService";
import { SQLiteUserStatusRepository } from "../repositories/sqlite/SQLiteUserStatusRepository";
import { UserService } from "../../application/services/UserService";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { GoogleAuthService } from "../../application/services/googleAuthService";
import { AuthService } from "../../application/services/AuthService";
import { UserRelationService } from "../../application/services/UserRelationService";
import { SQLiteUserRelationRepository } from "../repositories/sqlite/SQLiteUserRelationRepository";

export default async function UserRelationRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userRepository = new SQLiteUserRepository();
  const userRelationRepository = new SQLiteUserRelationRepository();
  const passwordService = new PasswordService(passwordRepository);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const authService = new AuthService(authRepository, passwordService);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const userStatusRepository = new SQLiteUserStatusRepository();
  const userStatusService = new UserStatusService(userStatusRepository);
  const userRelationService = new UserRelationService(userStatusService, userRelationRepository);
  const userStatusController = new UserStatusController(userService, userStatusService, userRelationService);

  server.get('', async (request: FastifyRequest, reply) => {
    await userStatusController.getUserStatus(request, reply);
  });

  server.get('/friends', async (request: FastifyRequest, reply) => {
    await userStatusController.getAllUserFriendsStatus(request, reply);
  })

  server.post('/refresh', async(request: FastifyRequest, reply) => {
    await userStatusController.refreshUserStatus(request, reply);
  });
}
