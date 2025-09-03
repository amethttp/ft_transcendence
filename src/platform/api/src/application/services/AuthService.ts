import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { ErrorMsg, ResponseError } from "../errors/ResponseError";
import Validators from "../helpers/Validators";
import { UserLoginRequest } from "../models/UserLoginRequest";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";

export class AuthService {
  // @ts-ignore
  private _authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this._authRepository = authRepository;
  }

  public validateLoginCredentials(userCredentials: UserLoginRequest) {
    if (
      !Validators.email(userCredentials.identifier) &&
      !Validators.username(userCredentials.identifier)
    ) {
      throw new ResponseError(ErrorMsg.LOGIN_FAILED);
    }
    if (!Validators.password(userCredentials.password)) {
      throw new ResponseError(ErrorMsg.LOGIN_FAILED);
    }
  }

  public validateRegistrationCredentials(userCredentials: UserRegistrationRequest) {
    if (!Validators.email(userCredentials.email)) {
      throw new ResponseError(ErrorMsg.REGISTRATION_INVALID_EMAIL);
    }
    if (!Validators.username(userCredentials.username)) {
      throw new ResponseError(ErrorMsg.REGISTRATION_INVALID_USERNAME);
    }
    if (!Validators.password(userCredentials.password)) {
      throw new ResponseError(ErrorMsg.REGISTRATION_INVALID_PASSWORD);
    }
  }
}
