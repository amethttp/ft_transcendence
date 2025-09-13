import { Auth } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import Validators from "../helpers/Validators";
import { EditUserRequest } from "../models/EditUserRequest";
import { LoggedUserResponse } from "../models/LoggedUserResponse";
import { UserProfileResponse } from "../models/UserProfileResponse";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";

export class UserService {
  private _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async newUser(newUser: UserRegistrationRequest, newAuth: Auth): Promise<User> {
    const userBlueprint: Partial<User> = {
      email: newUser.email,
      username: newUser.username,
      avatarUrl: "/default-avatar.webp",
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

  async updateUser(userId: number, updateInfo: EditUserRequest) {
    if (!Validators.email(updateInfo.email) || !Validators.username(updateInfo.username)) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }
    const userBlueprint: Partial<User> = {
      email: updateInfo.email,
      username: updateInfo.username,
    };
    if (!await this._userRepository.update(userId, userBlueprint)) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  async deleteUser(userId: number) {
    if (!(await this._userRepository.delete(userId))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }


  public toLoggedUserResponse(user: User): LoggedUserResponse {
    const userProfile: LoggedUserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      creationTime: user.creationTime,
      updateTime: user.updateTime,
    };

    return userProfile;
  }

  public toUserProfileResponse(user: User): UserProfileResponse {
    const userProfile: UserProfileResponse = {
      username: user.username,
      avatarUrl: user.avatarUrl,
      creationTime: user.creationTime,
      friend: false, // TODO: implement
      online: false // TODO: implement
    };

    return userProfile;
  }
}
