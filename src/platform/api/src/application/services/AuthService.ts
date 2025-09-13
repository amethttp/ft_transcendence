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
import { UserService } from "./UserService";
import StringTime from "../helpers/StringTime";

export class AuthService {
  private _authRepository: IAuthRepository;
  private _userService: UserService;
  private _passwordService: PasswordService;

  constructor(authRepository: IAuthRepository, userService: UserService, passwordService: PasswordService) {
    this._authRepository = authRepository;
    this._userService = userService;
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

  private validateLoginCredentials(userCredentials: UserLoginRequest) {
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

  private validateRegistrationCredentials(userCredentials: UserRegistrationRequest) {
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

  async loginUser(userCredentials: UserLoginRequest): Promise<User> {
    this.validateLoginCredentials(userCredentials);

    const user = await this._userService.getByIdentifier(userCredentials.identifier);
    if (user.auth.password === undefined) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }
    if (!(await this._passwordService.verify(user.auth.password.hash, userCredentials.password))) {
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }

    return user;
  }

  async updateLastLogin(user: User) {
    const authBlueprint: Partial<Auth> = {
      lastLogin: StringTime.now(),
    };
    await this._authRepository.update(user.auth.id, authBlueprint);
  }

  async registerUser(userCredentials: UserRegistrationRequest): Promise<User> {
    this.validateRegistrationCredentials(userCredentials);

    try {
      this._authRepository.dbBegin();
      const password = await this._passwordService.newPassword(userCredentials.password);
      const auth = await this.newAuth(password);
      const user = await this._userService.newUser(userCredentials, auth);
      this._authRepository.dbCommit();

      return user;
    } catch (error) {
      this._authRepository.dbRollback();
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
  }

  async sendRecoveryEmail(mailer: Transporter, email: string, token: string) {
    mailer.sendMail({
      from: '"AmethPong" <info@amethpong.fun>',
      to: email,
      subject: "Reset your password",
      text: `Click here to restore your password: http://localhost:5173/recover/${token}`,
    });
  }

  async restorePassword(user: User, newPassword: string) {
    if (!Validators.password(newPassword))
      throw new ResponseError(ErrorParams.REGISTRATION_INVALID_PASSWORD);

    if (user.auth.password === undefined) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const passwordId = user.auth.password.id;
    await this._passwordService.update(passwordId, newPassword);
  }
}
