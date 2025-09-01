import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorMsg, ResponseError } from "../errors/ResponseError";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user: User | null = await this.userRepository.findByUsername(username);

    if (user === null)
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user: User | null = await this.userRepository.findById(id);

    if (user === null)
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);

    return user;
  }

  private validateEmail(email: string) : boolean {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    return false;
  }

  private validateUsername(username: string) : boolean {
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
      return usernameRegex.test(username);
    }
    return false;
  }

  private validatePassword(password: string) : boolean {
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      return passwordRegex.test(password);
    }
    return false;
  }

  async registerUser(newUser: UserRegistrationRequest): Promise<User> {
    if (!this.validateEmail(newUser.email)) {
      throw new ResponseError(ErrorMsg.REGISTRATION_INVALID_EMAIL);
    }
    if (!this.validateUsername(newUser.username)) {
      throw new ResponseError(ErrorMsg.REGISTRATION_INVALID_USERNAME);
    }
    if (!this.validatePassword(newUser.password)) {
      throw new ResponseError(ErrorMsg.REGISTRATION_INVALID_PASSWORD);
    }

    // TODO: CREATE PARTIAL USER AND SET NEW AUTH (HANDLE PASS)
    const user: User | null = await this.userRepository.create(newUser as Partial<User>);
    if (user === null)
      throw new ResponseError(ErrorMsg.REGISTRATION_FAILED);

    return user;
  }
}
