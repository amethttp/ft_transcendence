import argon2 from "argon2";
import { Password } from "../../domain/entities/Password";
import { IPasswordRepository } from "../../domain/repositories/IPasswordRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { User } from "../../domain/entities/User";
import Validators from "../helpers/Validators";
import { AuthService } from "./AuthService";
import { Auth } from "../../domain/entities/Auth";

export class PasswordService {
  private _passwordRepository: IPasswordRepository;
  private _authService: AuthService;

  constructor(passwordRepository: IPasswordRepository, authService: AuthService) {
    this._passwordRepository = passwordRepository;
    this._authService = authService;
  }

  async newPassword(password: string): Promise<Password> {
    const passwordBlueprint: Partial<Password> = {
      hash: await argon2.hash(password),
    };

    const passwordId = await this._passwordRepository.create(passwordBlueprint);
    if (passwordId === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const createdPassword = await this._passwordRepository.findById(passwordId);
    if (createdPassword === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return createdPassword;
  }

  public async verify(userAuth: Auth, inputPassword: string): Promise<boolean> {
    if (!userAuth.password || !userAuth.password.id || !userAuth.password.hash) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }

    if (!(await argon2.verify(userAuth.password.hash, inputPassword))) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }

    return true;
  }

  async restoreUserPassword(user: User, newPassword: string) {
    if (!Validators.password(newPassword))
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_PASSWORD);

    if (!user.auth.password || !user.auth.password.id) {
      const newPasswordEntry = await this.newPassword(newPassword);
      await this._authService.attachPassword(user.auth.id, newPasswordEntry);
      return ;
    }
    await this.update(user.auth.password, newPassword);
  }

  async update(password: Password, newPassword: string) {
    if (password.id === null) {
      return ;
    }
    const passwordBlueprint: Partial<Password> = {
      hash: await argon2.hash(newPassword),
    };
    await this._passwordRepository.update(password.id, passwordBlueprint);
  }

  async delete(password: Password) {
    if (password.id === null) {
      return ;
    }
    if (!(await this._passwordRepository.delete(password.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
