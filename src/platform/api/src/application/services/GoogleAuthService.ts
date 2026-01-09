import { GoogleAuth } from "../../domain/entities/GoogleAuth";
import { IGoogleAuthRepository } from "../../domain/repositories/IGoogleAuthRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

export class GoogleAuthService {
  private _googleAuthRepository: IGoogleAuthRepository;

  constructor(googleAuthRepository: IGoogleAuthRepository) {
    this._googleAuthRepository = googleAuthRepository;
  }

  async newGoogleAuth(googleUserId: string): Promise<GoogleAuth> {
    const googleAuthBlueprint: Partial<GoogleAuth> = {
      googleUserId: googleUserId,
    };

    const id = await this._googleAuthRepository.create(googleAuthBlueprint);
    if (id === null)
    {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    const created = await this._googleAuthRepository.findById(id);
    if (created === null)
    {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return created;
  }

  async getByGoogleUserId(googleUserId: string): Promise<GoogleAuth | null> {
    return this._googleAuthRepository.findByGoogleUserId(googleUserId);
  }

  async delete(googleAuth: GoogleAuth) {
    if (!(await this._googleAuthRepository.delete(googleAuth.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
