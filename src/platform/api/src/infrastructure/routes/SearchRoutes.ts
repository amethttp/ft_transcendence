import { FastifyInstance, FastifyRequest } from "fastify";
import { UserService } from "../../application/services/UserService";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { SQLiteGoogleAuthRepository } from "../repositories/sqlite/SQLiteGoogleAuthRepository";
import { SQLitePasswordRepository } from "../repositories/sqlite/SQLitePasswordRepository";
import { SQLiteAuthRepository } from "../repositories/sqlite/SQLiteAuthRepository";
import { PasswordService } from "../../application/services/PasswordService";
import { GoogleAuthService } from "../../application/services/googleAuthService";
import { AuthService } from "../../application/services/AuthService";
import SearchController from "../controllers/SearchController";

export default async function SearchRoutes(server: FastifyInstance) {
  const googleAuthRepository = new SQLiteGoogleAuthRepository();
  const passwordRepository = new SQLitePasswordRepository();
  const authRepository = new SQLiteAuthRepository();
  const userRepository = new SQLiteUserRepository();
  const passwordService = new PasswordService(passwordRepository);
  const googleAuthService = new GoogleAuthService(googleAuthRepository);
  const authService = new AuthService(authRepository, passwordService);
  const userService = new UserService(userRepository, authService, passwordService, googleAuthService);
  const searchController = new SearchController(userService);

  server.get('', async (request: FastifyRequest, reply) => {
    await searchController.searchResults(request, reply);
  });

}
