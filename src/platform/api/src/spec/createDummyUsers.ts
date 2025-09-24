import AuthController from "../infrastructure/controllers/AuthController";
import { AuthService } from "../application/services/AuthService";
import { SQLiteAuthRepository } from "../infrastructure/repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "../application/services/UserService";
import { SQLiteUserRepository } from "../infrastructure/repositories/sqlite/SQLiteUserRepository";
import { PasswordService } from "../application/services/PasswordService";
import { SQLitePasswordRepository } from "../infrastructure/repositories/sqlite/SQLitePasswordRepository";
import { UserRegistrationRequest } from "../application/models/UserRegistrationRequest";
import { FastifyReply, FastifyRequest } from "fastify";
import { UserVerificationService } from "../application/services/UserVerificationService";
import { SQLiteUserVerificationRepository } from "../infrastructure/repositories/sqlite/SQLiteUserVerificationRepository";
import { RecoverPasswordService } from "../application/services/RecoverPasswordService";
import { SQLiteRecoverPasswordRepository } from "../infrastructure/repositories/sqlite/SQLiteRecoverPasswordRepository";
import { GoogleAuthService } from "../application/services/googleAuthService";
import { SQLiteGoogleAuthRepository } from "../infrastructure/repositories/sqlite/SQLiteGoogleAuthRepository";
import { UserStatusService } from "../application/services/UserStatusService";
import { SQLiteUserStatusRepository } from "../infrastructure/repositories/sqlite/SQLiteUserStatusRepository";

export const createDummyUsers = async () => {
  const authController = new AuthController(
    new AuthService(new SQLiteAuthRepository(), new PasswordService(new SQLitePasswordRepository)),
    new PasswordService(new SQLitePasswordRepository),
    new RecoverPasswordService(new SQLiteRecoverPasswordRepository()),
    new UserService(new SQLiteUserRepository(), new AuthService(new SQLiteAuthRepository(), new PasswordService(new SQLitePasswordRepository)), new PasswordService(new SQLitePasswordRepository), new GoogleAuthService(new SQLiteGoogleAuthRepository)),
    new UserVerificationService(new SQLiteUserVerificationRepository()),
    new UserStatusService(new SQLiteUserStatusRepository())
  );

  const testUsers: UserRegistrationRequest[] = [
    {
      username: "vperez-f",
      email: "vperez-f@gmail.com",
      password: "Pepito.1234"
    },
    {
      username: "arcanava",
      email: "arzelcanavate@gmail.com",
      password: "Pepito.1234"
    },
    {
      username: "cfidalgo",
      email: "cfidalgo@gmail.com",
      password: "12dummud21"
    }
  ]

  for (const user of testUsers) {
    try {
      await authController.register({ body: user } as FastifyRequest, {} as FastifyReply);
    }
    catch (e) {
      // Do nothing
    }
  }
}
