import { Auth } from "../../domain/entities/Auth";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import StringTime from "../helpers/StringTime";
import Validators from "../helpers/Validators";
import { EditUserRequest } from "../models/EditUserRequest";
import { LoggedUserResponse } from "../models/LoggedUserResponse";
import { Relation } from "../models/Relation";
import { UserProfile } from "../models/UserProfile";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";
import { TStatusType } from "../models/UserStatusDto";
import { AuthService } from "./AuthService";
import { PasswordService } from "./PasswordService";
import { GoogleAuthService } from "./GoogleAuthService";

export class UserService {
  private _userRepository: IUserRepository;
  private _authService: AuthService;
  private _passwordService: PasswordService;
  private _googleAuthService: GoogleAuthService;

  constructor(userRepository: IUserRepository, authService: AuthService, passwordService: PasswordService, googleAuthService: GoogleAuthService) {
    this._userRepository = userRepository;
    this._authService = authService;
    this._passwordService = passwordService;
    this._googleAuthService = googleAuthService;
  }

  async newUser(newUser: UserRegistrationRequest, newAuth: Auth): Promise<User> {
    const userBlueprint: Partial<User> = {
      email: newUser.email,
      username: newUser.username,
      birthDate: newUser.birthDate,
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

  async registerUser(userCredentials: UserRegistrationRequest): Promise<User> {
    try {
      await this._userRepository.dbBegin();
      const password = await this._passwordService.newPassword(userCredentials.password);
      const auth = await this._authService.newAuth(password);
      const user = await this.newUser(userCredentials, auth);
      await this._userRepository.dbCommit();

      return user;
    } catch (error) {
      await this._userRepository.dbRollback();
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
  }

  async getByUsername(username: string): Promise<User> {
    const user = await this._userRepository.findByUsername(username);
    if (user === null) {
      throw new ResponseError(ErrorParams.USER_NOT_FOUND);
    }

    return user;
  }

  async getAllByUsername(username: string): Promise<User[]> {
    const users = await this._userRepository.findAllByUsername(username);
    if (users === null)
      return [];
    else
      return users;
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
    if (!Validators.email(updateInfo.email)
      || !Validators.username(updateInfo.username)
      || !Validators.birthDate(updateInfo.birthDate)) {
      throw new ResponseError(ErrorParams.BAD_REQUEST);
    }
    const userBlueprint: Partial<User> = {
      email: updateInfo.email,
      username: updateInfo.username,
      birthDate: updateInfo.birthDate,
    };
    if (!await this._userRepository.update(userId, userBlueprint)) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  async erasePersonalInformation(user: User) {
    const userBlueprint: Partial<User> = {
      email: "deletedEmail" + user.id + "@deleted.com",
      username: "deletedUser" + user.id,
      avatarUrl: "deletedAvatar" + user.id,
      creationTime: StringTime.epoch(),
      updateTime: StringTime.epoch(),
    }
    try {
      await this._userRepository.dbBegin();

      if (!(await this._userRepository.update(user.id, userBlueprint))) {
        throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
      }
      if (user.auth.googleAuth) { // TODO: reminder to check about nulls repeated deletes and possible dangling data
        await this._googleAuthService.delete(user.auth.googleAuth);
      }
      if (user.auth.password) {
        await this._passwordService.delete(user.auth.password);
      }
      await this._authService.erasePersonalInformation(user);

      await this._userRepository.dbCommit();
    } catch (error) {
      console.log(error);
      await this._userRepository.dbRollback();
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  public static toLoggedUserResponse(user: User): LoggedUserResponse {
    const userProfile: LoggedUserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      birthDate: user.birthDate,
      avatarUrl: user.avatarUrl,
      creationTime: user.creationTime,
      updateTime: user.updateTime,
    };

    return userProfile;
  }

  public static toUserProfile(user: User, relationStatus: Relation, online: TStatusType): UserProfile {
    const userProfile: UserProfile = {
      username: user.username,
      avatarUrl: user.avatarUrl,
      creationTime: user.creationTime,
      relation: relationStatus,
      status: online
    };

    return userProfile;
  }

  async updateAvatar(userId: number, newPath: string) {
    const userBlueprint: Partial<User> = {
      avatarUrl: newPath,
    };
    if (!await this._userRepository.update(userId, userBlueprint)) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
