import { FastifyInstance, FastifyRequest } from "fastify";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { GoogleAuthService } from "../../application/services/GoogleAuthService";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { SQLiteUserRelationRepository } from "../repositories/sqlite/SQLiteUserRelationRepository";
import { UserRelationService } from "../../application/services/UserRelationService";
import UserRelationController from "../controllers/UserRelationController";
import { SQLiteUserStatusRepository } from "../repositories/sqlite/SQLiteUserStatusRepository";
import { UserStatusService } from "../../application/services/UserStatusService";

export default async function userRelationRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userRepository = new SQLiteUserRepository();
  const userRelationRepository = new SQLiteUserRelationRepository();
  const userStatusRepository = new SQLiteUserStatusRepository();
  const authService = new AuthService(authRepository);
  const passwordService = new PasswordService(passwordRepository, authService);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const userStatusService = new UserStatusService(userStatusRepository);
  const userRelationService = new UserRelationService(userStatusService, userRelationRepository);
  const userRelationController = new UserRelationController(userService, userRelationService);

  server.get('/friends', async (request: FastifyRequest, reply) => {
    await userRelationController.getUserFriends(request, reply);
  });

  server.get('/requests', async (request: FastifyRequest, reply) => {
    await userRelationController.getUserPendingRequests(request, reply);
  });

  server.get('/blocked', async (request: FastifyRequest, reply) => {
    await userRelationController.getUserBlockedList(request, reply);
  });

  server.get('/add/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userRelationController.addFriend(request, reply);
  });

  server.get('/remove/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userRelationController.removeFriend(request, reply);
  });

  server.get('/accept/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userRelationController.acceptFriendRequest(request, reply);
  });

  server.get('/decline/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userRelationController.declineFriendRequest(request, reply);
  });

  server.get('/block/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userRelationController.blockUser(request, reply);
  });

  server.get('/unblock/:username', async (request: FastifyRequest<{ Params: { username: string } }>, reply) => {
    await userRelationController.unblockUser(request, reply);
  });
}
