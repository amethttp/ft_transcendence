import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo, JwtPayloadType } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";
import { UserLoginRequest } from "../../application/models/UserLoginRequest";
import { UserRegistrationRequest } from "../../application/models/UserRegistrationRequest";
import { AuthService } from "../../application/services/AuthService";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { UserLoginVerificationRequest } from "../../application/models/UserLoginVerificationRequest";
import { UserVerificationService } from "../../application/services/UserVerificationService";
import { RecoveryEmailRequest } from "../../application/models/RecoveryEmailRequest";
import { PasswordRecoveryRequest } from "../../application/models/PasswordRecoveryRequest";
import { RecoverPasswordService } from "../../application/services/RecoverPasswordService";
import { UserService } from "../../application/services/UserService";
import { randomBytes } from "crypto";
import { PasswordService } from "../../application/services/PasswordService";
import { RelationType } from "../../application/models/Relation";
import { UserStatusService } from "../../application/services/UserStatusService";
import { StatusType } from "../../application/models/UserStatusDto";
import { OAuth2Service } from "../auth/OAuth2";
import { GoogleAuthenticationRequest } from "../../application/models/GoogleAuthenticationRequest";

export default class AuthController {
  private _authService: AuthService;
  private _passwordService: PasswordService;
  private _recoverPasswordService: RecoverPasswordService;
  private _userService: UserService;
  private _userVerificationService: UserVerificationService;
  private _userStatusService: UserStatusService;

  constructor(
    authService: AuthService,
    passwordService: PasswordService,
    recoverPasswordService: RecoverPasswordService,
    userService: UserService,
    userVerificationService: UserVerificationService,
    userStatusService: UserStatusService
  ) {
    this._authService = authService;
    this._passwordService = passwordService;
    this._recoverPasswordService = recoverPasswordService;
    this._userService = userService;
    this._userVerificationService = userVerificationService;
    this._userStatusService = userStatusService;
  }

  public async accessRefresh(request: FastifyRequest, reply: FastifyReply, jwt: any) {
    const refreshToken = request.cookies.RefreshToken;

    try {
      let decodedToken;
      try {
        decodedToken = jwt.verify(refreshToken);
      } catch (verifyErr) {
        throw new ResponseError(ErrorParams.AUTH_INVALID_ACCESS);
      }
      const tokenPayload = { sub: decodedToken.sub as number, type: 'access' as JwtPayloadType };
      const accessTokenExpiry = 5;
      const secondsInAMinute = 60;
      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, accessTokenExpiry + 'm');

      reply.header('set-cookie', [
        `AccessToken=${newAccessToken}; Secure; SameSite=Strict; Path=/; max-age=${accessTokenExpiry * secondsInAMinute}`,
      ]);

      reply.status(200).send({credentials: `AccessToken=${newAccessToken}; RefreshToken=${refreshToken};`});
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  public async refresh(request: FastifyRequest, reply: FastifyReply, jwt: any) {
    const refreshToken = request.cookies.RefreshToken;

    try {
      let decodedToken;
      try {
        decodedToken = jwt.verify(refreshToken);
      } catch (verifyErr) {
        throw new ResponseError(ErrorParams.AUTH_INVALID_ACCESS);
      }
      const tokenPayload = { sub: decodedToken.sub as number, type: 'access' as JwtPayloadType };
      const accessTokenExpiry = 5;
      const secondsInAMinute = 60;
      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, accessTokenExpiry + 'm');

      reply.header('set-cookie', [
        `AccessToken=${newAccessToken}; Secure; SameSite=Strict; Path=/; max-age=${accessTokenExpiry * secondsInAMinute}`,
      ]);

      reply.status(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  private async setJWTHeaders(id: number, reply: FastifyReply): Promise<string[]> {
    const accessTokenExpiry = 5;
    const refreshTokenExpiry = 30;
    const secondsInAMinute = 60;
    const secondsInADay = 86400;
    const [accessToken, refreshToken] = await Promise.all([
      JwtAuth.sign(reply, { sub: id, type: 'access' }, accessTokenExpiry + 'm'),
      JwtAuth.sign(reply, { sub: id, type: 'refresh' }, refreshTokenExpiry + 'd'),
    ]);
    const headers = [
      `AccessToken=${accessToken}; Secure; SameSite=Strict; Path=/; max-age=${accessTokenExpiry * secondsInAMinute}`,
      `RefreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; max-age=${refreshTokenExpiry * secondsInADay}`
    ];

    return headers;
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginCredentials = request.body as UserLoginRequest;
      this._authService.validateLoginCredentials(loginCredentials);
      const user = await this._userService.getByIdentifier(loginCredentials.identifier);
      const needs2FA = await this._passwordService.verify(user.auth, loginCredentials.password);
      if (needs2FA) {
        const userVerification = await this._userVerificationService.newUserVerification(user);
        this._userVerificationService.sendVerificationCode(request.server.mailer, user.email, userVerification.code);
      }

      reply.status(200).send({ id: user.id });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(400).send(new ResponseError(ErrorParams.LOGIN_FAILED).toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async verifyLogin(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userCredentials = request.body as UserLoginVerificationRequest;
      if (process.env.ENV === "development" || await this._userVerificationService.verifyAndDelete(userCredentials.userId, userCredentials.code)) {
        const JWTHeaders = await this.setJWTHeaders(userCredentials.userId, reply);
        const user = await this._userService.getById(userCredentials.userId);
        await this._authService.updateLastLogin(user);
        reply.header('set-cookie', JWTHeaders);
        reply.status(200).send({ success: true });
      }
      else
        reply.code(400).send(new ResponseError(ErrorParams.LOGIN_FAILED).toDto());
    } catch (err) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }

  async recoveryEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const recoveryRequest = request.body as RecoveryEmailRequest;
      const user = await this._userService.getByEmail(recoveryRequest.email);
      const token = randomBytes(32).toString("base64url");
      await this._recoverPasswordService.newRecoverPassword(user, token);

      this._authService.sendRecoveryEmail(request.server.mailer, user.email, token);
      reply.status(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(200).send({ success: true }); // TODO: Maybe not so strict on success only
      } else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async checkRecoverToken(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      const token = request.params.token;
      const user = await this._recoverPasswordService.getUserByToken(token);
      const relation = { type: RelationType.NO_RELATION, owner: false };
      const userProfile = UserService.toUserProfile(user, relation, 2); // TODO: Check if necessary to return a full user

      reply.code(200).send(userProfile);
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      } else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async recoverPassword(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      const token = request.params.token;
      const passRequest = request.body as PasswordRecoveryRequest;
      const user = await this._recoverPasswordService.getUserByTokenAndDeleteRecover(token);
      await this._passwordService.restoreUserPassword(user, passRequest.password);

      reply.status(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      } else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const jwtUser = request.user as JwtPayloadInfo;
    const user = await this._userService.getById(jwtUser.sub);
    await this._userStatusService.setUserStatus(user, StatusType.OFFLINE);

    reply.header('set-cookie', [
      `AccessToken=; Secure; SameSite=Strict; Path=/; max-age=0`,
      `RefreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; max-age=0`
    ]);

    return reply.status(200).send({ success: true });
  }

  async getGoogleAuthUrl(request: FastifyRequest, reply: FastifyReply) {
    try {
      (void request);
      const oauth2Service = new OAuth2Service();
      const url = oauth2Service.generateGoogleAuthUrl();
      reply.status(200).send({ url: url });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      } else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async authenticateWithGoogle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as GoogleAuthenticationRequest;
      const oauth2Service = new OAuth2Service();
      const payload = await oauth2Service.getGooglePayload(body);
      const user = await this._userService.authenticateWithGoogle(payload);

      const JWTHeaders = await this.setJWTHeaders(user.id, reply);
      await this._authService.updateLastLogin(user);
      await this._userStatusService.createUserConnectionStatus(user).catch(() => {});

      reply.header('set-cookie', JWTHeaders);
      reply.status(200).send({ id: user.id });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      } else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const registrationCredentials = request.body as UserRegistrationRequest;
      this._authService.validateRegistrationCredentials(registrationCredentials);
      const registeredUser = await this._userService.registerUser(registrationCredentials);
      await this._userStatusService.createUserConnectionStatus(registeredUser);
      reply.header('set-cookie', [
        `AccessToken=; Secure; SameSite=Strict; Path=/; max-age=0`,
        `RefreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; max-age=0`
      ]);

      reply.status(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }
}
