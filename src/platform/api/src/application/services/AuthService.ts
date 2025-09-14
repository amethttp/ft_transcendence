import { Transporter } from "nodemailer";
import { Auth } from "../../domain/entities/Auth";
import { GoogleAuth } from "../../domain/entities/GoogleAuth";
import { Password } from "../../domain/entities/Password";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import Validators from "../helpers/Validators";
import { UserLoginRequest } from "../models/UserLoginRequest";
import { UserRegistrationRequest } from "../models/UserRegistrationRequest";
import { PasswordService } from "./PasswordService";
import StringTime from "../helpers/StringTime";

export class AuthService {
  private _authRepository: IAuthRepository;
  private _passwordService: PasswordService;

  constructor(authRepository: IAuthRepository, passwordService: PasswordService) {
    this._authRepository = authRepository;
    this._passwordService = passwordService;
  }

  async newAuth(newPassword?: Password, newGoogleAuth?: GoogleAuth): Promise<Auth> {
    if (newPassword !== undefined && newGoogleAuth !== undefined) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    const authBlueprint: Partial<Auth> = {};
    if (newPassword !== undefined) {
      authBlueprint.password = newPassword;
    }
    if (newGoogleAuth !== undefined) {
      authBlueprint.googleAuth = newGoogleAuth;
    }

    const authId = await this._authRepository.create(authBlueprint);
    if (authId === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const createdAuth = await this._authRepository.findById(authId);
    if (createdAuth === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return createdAuth;
  }

  public validateLoginCredentials(userCredentials: UserLoginRequest) {
    if (
      !Validators.email(userCredentials.identifier) &&
      !Validators.username(userCredentials.identifier)
    ) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }
    if (!Validators.password(userCredentials.password)) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }
  }

  public validateRegistrationCredentials(userCredentials: UserRegistrationRequest) {
    if (!Validators.email(userCredentials.email)) {
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_EMAIL);
    }
    if (!Validators.username(userCredentials.username)) {
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_USERNAME);
    }
    if (!Validators.password(userCredentials.password)) {
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_PASSWORD);
    }
  }

  async applyLoginMethod(user: User, loginCredentials: UserLoginRequest): Promise<boolean> {
    if (user.auth.password) {
      if (!(await this._passwordService.verify(user.auth.password.hash, loginCredentials.password))) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }
      return true;
    } else if (user.auth.googleAuth) {
      // TODO: login via Google
      // return false;
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    } else {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }
  }

  async updateLastLogin(user: User) {
    const authBlueprint: Partial<Auth> = {
      lastLogin: StringTime.now(),
    };
    await this._authRepository.update(user.auth.id, authBlueprint);
  }

  async sendRecoveryEmail(mailer: Transporter, email: string, token: string) {
    mailer.sendMail({
      from: '"AmethPong" <info@amethpong.fun>',
      to: email,
      subject: "Reset your password",
      text: `Click here to restore your password: http://localhost:5173/recover/${token}`,
    });
  }

  async erasePersonalInformation(user: User) {
    const authBlueprint: Partial<Auth> = {
      lastLogin: StringTime.epoch(),
    };
    await this._authRepository.update(user.auth.id, authBlueprint);
  }

  async delete(auth: Auth) {
    if (!(await this._authRepository.delete(auth.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
