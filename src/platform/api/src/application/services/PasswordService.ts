import argon2 from "argon2";
import { Password } from "../../domain/entities/Password";
import { IPasswordRepository } from "../../domain/repositories/IPasswordRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

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
    const createdPassword = await this._passwordRepository.findById(passwordId || -1);
    if (createdPassword === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return createdPassword;
  }

  async verify(userPassword: string, inputPassword: string): Promise<boolean> {
    return await argon2.verify(userPassword, inputPassword);
  }
}
