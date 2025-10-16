
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserService } from "../../application/services/UserService";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { AuthService } from "../../application/services/AuthService";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { GoogleAuthService } from "../../application/services/GoogleAuthService";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { TournamentService } from "../../application/services/TournamentService";
import { SQLiteTournamentRepository } from "../repositories/sqlite/SQLiteTournamentRepository";
import { SQLiteTournamentPlayerRepository } from "../repositories/sqlite/SQLiteTournamentPlayerRepository";
import { TournamentPlayerService } from "../../application/services/TournamentPlayerService";
import TournamentController from "../controllers/TournamentController";

export default async function tournamentRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userRepository = new SQLiteUserRepository();
  const passwordService = new PasswordService(passwordRepository);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const authService = new AuthService(authRepository, passwordService);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const tournamentRepository = new SQLiteTournamentRepository();
  const tournamentService = new TournamentService(tournamentRepository);
  const tournamentPlayerRepository = new SQLiteTournamentPlayerRepository();
  const tournamentPlayerService = new TournamentPlayerService(tournamentPlayerRepository);
  const tournamentController = new TournamentController(userService, tournamentService, tournamentPlayerService);

  server.post('', async (request: FastifyRequest, reply: FastifyReply) => {
    await tournamentController.newTournament(request, reply);
  });

  server.get('/list', async (request: FastifyRequest, reply: FastifyReply) => {
    await tournamentController.getList(request, reply);
  });

  server.get('/:token', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await tournamentController.getByToken(request, reply);
  });

  server.post('/:token/join', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await tournamentController.join(request, reply);
  });

  server.post('/:token/leave', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await tournamentController.leave(request, reply);
  });
}
