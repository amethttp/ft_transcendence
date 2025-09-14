import argon2 from "argon2";
import { Password } from "../../domain/entities/Password";
import { IPasswordRepository } from "../../domain/repositories/IPasswordRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { User } from "../../domain/entities/User";
import Validators from "../helpers/Validators";

export class PasswordService {
  private _passwordRepository: IPasswordRepository;

  constructor(passwordRepository: IPasswordRepository) {
    this._passwordRepository = passwordRepository;
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

  public async verify(userPassword: string, inputPassword: string): Promise<boolean> {
    return await argon2.verify(userPassword, inputPassword);
  }

  async restoreUserPassword(user: User, newPassword: string) {
    if (!Validators.password(newPassword))
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_PASSWORD);

    if (user.auth.password === undefined) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
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
