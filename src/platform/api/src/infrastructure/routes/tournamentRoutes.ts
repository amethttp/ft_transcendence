
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
import { TournamentRoundService } from "../../application/services/TournamentRoundService";
import { SQLiteTournamentRoundRepository } from "../repositories/sqlite/SQLiteTournamentRoundRepository";
import { SQLiteMatchRepository } from "../repositories/sqlite/SQLiteMatchRepository";
import { SQLiteMatchPlayerRepository } from "../repositories/sqlite/SQLiteMatchPlayerRepository";
import { MatchService } from "../../application/services/MatchService";
import { MatchPlayerService } from "../../application/services/MatchPlayerService";

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
  const tournamentRoundRepository = new SQLiteTournamentRoundRepository();
  const tournamentRoundService = new TournamentRoundService(tournamentRoundRepository);
  const matchRepository = new SQLiteMatchRepository();
  const matchPlayerRepository = new SQLiteMatchPlayerRepository();
  const matchService = new MatchService(matchRepository);
  const matchPlayerService = new MatchPlayerService(matchPlayerRepository);
  const tournamentController = new TournamentController(userService, tournamentService, tournamentPlayerService, tournamentRoundService, matchService, matchPlayerService);

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

  server.post('/:token/start', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await tournamentController.start(request, reply);
  });

   server.post('/:token/fill', async (request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    await tournamentController.fill(request, reply);
  });
}
