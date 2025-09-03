import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ErrorMsg, ResponseError } from "../errors/ResponseError";
import { UserLoginRequest } from "../models/UserLoginRequest";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";
import Validators from "../helpers/Validators";

export class UserService {
  private _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this._userRepository.findByUsername(username);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this._userRepository.findByEmail(email);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this._userRepository.findById(id);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  private async getUserByIdentifier(identifier: string): Promise<User> {
    let user = await this._userRepository.findByUsername(identifier);
    if (user === null) user = await this._userRepository.findByEmail(identifier);
    if (user === null) {
      throw new ResponseError(ErrorMsg.USER_NOT_FOUND);
    }

    return user;
  }

  async loginUser(userCredentials: UserLoginRequest): Promise<User> {
    const shallowUser = await this.getUserByIdentifier(userCredentials.identifier);
    const deepUser = await this._userRepository.getUser(shallowUser.id, true); // TODO: refactor
    const placeholderHash = (deepUser as any).hash;
    if (!Validators.matchPasswords(userCredentials.password, placeholderHash)) {
      throw new ResponseError(ErrorMsg.LOGIN_FAILED);
    }

    return shallowUser;
  }

  async registerUser(newUser: UserRegistrationRequest): Promise<User> {
    // TODO: CREATE PARTIAL USER AND SET NEW AUTH (HANDLE PASS) // existing email username...
    const userId = await this._userRepository.create(newUser as Partial<User>);
    const createdUser = await this._userRepository.findById(userId || -1);
    if (createdUser === null) {
      throw new ResponseError(ErrorMsg.REGISTRATION_FAILED);
    }

    return createdUser;
  }
}
