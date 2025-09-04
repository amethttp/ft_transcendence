import AuthController from "../infrastructure/controllers/AuthController";
import { AuthService } from "../application/services/AuthService";
import { SQLiteAuthRepository } from "../infrastructure/repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "../application/services/UserService";
import { SQLiteUserRepository } from "../infrastructure/repositories/sqlite/SQLiteUserRepository";
import { PasswordService } from "../application/services/PasswordService";
import { SQLitePasswordRepository } from "../infrastructure/repositories/sqlite/SQLitePasswordRepository";
import { UserRegistrationRequest } from "../application/models/UserRegistrationRequest";
import { FastifyReply, FastifyRequest } from "fastify";

export const createDummyUsers = async () => {
  const authController = new AuthController(new AuthService(new SQLiteAuthRepository(), new UserService(new SQLiteUserRepository()), new PasswordService(new SQLitePasswordRepository)));

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

  console.log("Finished creating users");
}