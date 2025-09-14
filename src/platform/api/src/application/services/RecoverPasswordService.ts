import { RecoverPassword } from "../../domain/entities/RecoverPassword";
import { User } from "../../domain/entities/User";
import { IRecoverPasswordRepository } from "../../domain/repositories/IRecoverPasswordRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

export class RecoverPasswordService {
  private _recoverPasswordRepository: IRecoverPasswordRepository;

  constructor(recoverPasswordRepository: IRecoverPasswordRepository) {
    this._recoverPasswordRepository = recoverPasswordRepository;
  }

  async newRecoverPassword(inputUser: User, inputToken: string): Promise<RecoverPassword | null> {
    const recoverPasswordBlueprint: Partial<RecoverPassword> = {
      user: inputUser,
      token: inputToken
    };

    const id = await this._recoverPasswordRepository.create(recoverPasswordBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const recoverPassword = await this._recoverPasswordRepository.findById(id);
    if (recoverPassword === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return recoverPassword;
  }

  async getByToken(token: string): Promise<RecoverPassword> {
    const recoverPassword = await this._recoverPasswordRepository.findByToken(token);
    if (recoverPassword === null) {
      throw new ResponseError(ErrorParams.PASSWORD_RECOVER_FAILED);
    }

    return recoverPassword;
  }

  async getUserByToken(token: string): Promise<User> {
    const recoverPassword = await this._recoverPasswordRepository.findByToken(token);
    if (recoverPassword === null) {
      throw new ResponseError(ErrorParams.PASSWORD_RECOVER_FAILED);
    }
    const user = recoverPassword.user;

    return user;
  }

  async getUserByTokenAndDeleteRecover(token: string): Promise<User> {
    const recoverPassword = await this._recoverPasswordRepository.findByToken(token);
    if (recoverPassword === null) {
      throw new ResponseError(ErrorParams.PASSWORD_RECOVER_FAILED);
    }
    const user = recoverPassword.user;
    await this._recoverPasswordRepository.delete(recoverPassword.id);

    return user;
  }

  async eraseAllUserRecoverPasswords(user: User) {
    await this._recoverPasswordRepository.deleteAllByUser(user.id);
  }

  async delete(recoverPassword: RecoverPassword) {
    if (!(await this._recoverPasswordRepository.delete(recoverPassword.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}