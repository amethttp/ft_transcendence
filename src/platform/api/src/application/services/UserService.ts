import { Auth } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";

export class UserService {
  private _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async getByUsername(username: string): Promise<User> {
    const user = await this._userRepository.findByUsername(username);
    if (user === null) {
      throw new ResponseError(ErrorParams.USER_NOT_FOUND);
    }

    return user;
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this._userRepository.findByEmail(email);
    if (user === null) {
      throw new ResponseError(ErrorParams.USER_NOT_FOUND);
    }

    return user;
  }

  async getByIdentifier(identifier: string): Promise<User> {
    let user = await this._userRepository.findByUsername(identifier);
    if (user === null) user = await this._userRepository.findByEmail(identifier);
    if (user === null) {
      throw new ResponseError(ErrorParams.USER_NOT_FOUND);
    }

    return user;
  }

  async getById(id: number): Promise<User> {
    const user = await this._userRepository.findById(id);
    if (user === null) {
      throw new ResponseError(ErrorParams.USER_NOT_FOUND);
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
    if (userId === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const createdUser = await this._userRepository.findById(userId);
    if (createdUser === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return createdUser;
  }
}
