import { Auth } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorMsg, ResponseError } from "../errors/ResponseError";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";

export class UserService {
  private _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async getByUsername(username: string): Promise<User> {
    const user = await this._userRepository.findByUsername(username);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this._userRepository.findByEmail(email);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async getByIdentifier(identifier: string): Promise<User> {
    let user = await this._userRepository.findByUsername(identifier);
    if (user === null) user = await this._userRepository.findByEmail(identifier);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }
  
  async getByIdShallow(id: number): Promise<User> {
    const user = await this._userRepository.findByIdPH(id, false);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async getByIdDeep(id: number): Promise<User> {
    const user = await this._userRepository.findByIdPH(id, true);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async newUser(newUser: UserRegistrationRequest, newAuth: Auth): Promise<User> {
    const userBlueprint: Partial<User> = {
      email: newUser.email,
      username: newUser.username,
      avatarUrl: "defaultAvatar",
      auth: newAuth
    };

    const userId = await this._userRepository.create(userBlueprint);
    const createdUser = await this._userRepository.findById(userId || -1);
    if (createdUser === null) {
      throw new ResponseError(ErrorMsg.REGISTRATION_FAILED);
    }
    
    return createdUser;
  }
}
