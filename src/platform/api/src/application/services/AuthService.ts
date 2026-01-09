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
import StringTime from "../helpers/StringTime";

export class AuthService {
  private _authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this._authRepository = authRepository;
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
    if (!Validators.birthDate(userCredentials.birthDate)) {
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_BIRTH_DATE);
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
      text: `Click here to restore your password: ${process.env.CLIENT_HOST}/recover/${token}`,
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

  async attachPassword(authId: number, password: Password) {
    const authBlueprint: Partial<Auth> = {
      password: password,
    };
    if ((await this._authRepository.update(authId, authBlueprint)) === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }

  async attachGoogleAuth(authId: number, googleAuth: GoogleAuth) {
    const authBlueprint: Partial<Auth> = {
      googleAuth: googleAuth,
    };
    if ((await this._authRepository.update(authId, authBlueprint)) === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
