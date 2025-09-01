import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorMsg, ResponseError } from "../errors/ResponseError";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  checkPassword(inputPassword: string, userPassword: string) {
    if (inputPassword !== userPassword) // TODO: hash passwords...
      throw new ResponseError(ErrorMsg.LOGIN_FAILED);
  }

  async getUserByIdentifier(identifier: string): Promise<User> {
    let user: User | null;
    user = await this.userRepository.findByUsername(identifier);
    if (user === null)
      user = await this.userRepository.findByEmail(identifier);

    if (user === null)
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);

    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user: User | null = await this.userRepository.findByUsername(username);

    if (user === null)
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user: User | null = await this.userRepository.findByEmail(email);

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
}
