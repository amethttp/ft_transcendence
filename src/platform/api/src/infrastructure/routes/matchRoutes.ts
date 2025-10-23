
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { GoogleAuthService } from "../../application/services/GoogleAuthService";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { MatchService } from "../../application/services/MatchService";
import { MatchPlayerService } from "../../application/services/MatchPlayerService";
import { SQLiteMatchRepository } from "../repositories/sqlite/SQLiteMatchRepository";
import { SQLiteMatchPlayerRepository } from "../repositories/sqlite/SQLiteMatchPlayerRepository";
import MatchController from "../controllers/MatchController";

export default async function matchRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userRepository = new SQLiteUserRepository();
  const matchRepository = new SQLiteMatchRepository();
  const matchPlayerRepository = new SQLiteMatchPlayerRepository();
  const passwordService = new PasswordService(passwordRepository);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const authService = new AuthService(authRepository, passwordService);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const matchService = new MatchService(matchRepository);
  const matchPlayerService = new MatchPlayerService(matchPlayerRepository);
  const matchController = new MatchController(matchService, matchPlayerService, userService);

  server.post('', async (request: FastifyRequest, reply: FastifyReply) => {
    await matchController.newMatch(request, reply);
  });

  server.put('/:token', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await matchController.updateMatch(request, reply);
  });

  server.delete('/:token', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await matchController.deleteMatch(request, reply);
  });

  server.get('', async (request: FastifyRequest<{ Querystring: { userId: number, matchId: number } }>, reply) => {
    await matchController.getPlayer(request, reply);
  });

  server.get('/:token/join', async (request: FastifyRequest<{ Params: { token: string } }>, reply) => {
    await matchController.joinMatch(request, reply);
  });

  server.get('/list', async (request: FastifyRequest, reply: FastifyReply) => {
    await matchController.getList(request, reply);
  });
}
