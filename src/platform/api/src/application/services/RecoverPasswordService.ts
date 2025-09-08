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
    return (await this._recoverPasswordRepository.findById(id || -1));
  }

  async getUserByToken(token: string): Promise<number> {
    const recoverPassword = await this._recoverPasswordRepository.findByToken(token);
    if (recoverPassword === null)
      throw new ResponseError(ErrorParams.PASSWORD_RECOVER_FAILED);

    return (recoverPassword as any)["user_id"];
  }
}