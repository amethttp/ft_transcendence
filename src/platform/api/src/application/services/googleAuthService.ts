import { GoogleAuth } from "../../domain/entities/GoogleAuth";
import { IGoogleAuthRepository } from "../../domain/repositories/IGoogleAuthRepositroy";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

export class GoogleAuthService {
  private _googleAuthRepository: IGoogleAuthRepository;

  constructor(googleAuthRepository: IGoogleAuthRepository) {
    this._googleAuthRepository = googleAuthRepository;
  }

  async delete(googleAuth: GoogleAuth) {
    if (!(await this._googleAuthRepository.delete(googleAuth.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}