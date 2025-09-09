import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";
import { UserLoginRequest } from "../../application/models/UserLoginRequest";
import { UserProfile } from "../../application/models/UserProfile";
import { UserRegistrationRequest } from "../../application/models/UserRegistrationRequest";
import { AuthService } from "../../application/services/AuthService";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";

export default class AuthController {
  private _authService: AuthService;

  constructor(authService: AuthService) {
    this._authService = authService;
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
      const tokenPayload = decodedToken as JwtPayloadInfo;
      const accessTokenExpiry = 5;
      const mins = 60;
      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, accessTokenExpiry + 'm');

      reply.header('set-cookie', [
        `AccessToken=${newAccessToken}; Secure; SameSite=None; Path=/; max-age=${accessTokenExpiry * mins}`,
      ]);

      reply.status(200).send({success: true});
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
    const mins = 60;
    const days = 86400;
    const [accessToken, refreshToken] = await Promise.all([
      JwtAuth.sign(reply, { sub: id } as JwtPayloadInfo, accessTokenExpiry + 'm'),
      JwtAuth.sign(reply, { sub: id } as JwtPayloadInfo, refreshTokenExpiry + 'd'),
    ]);
    const headers = [
      `AccessToken=${accessToken}; Secure; SameSite=None; Path=/; max-age=${accessTokenExpiry * mins}`,
      `RefreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None; Path=/; max-age=${refreshTokenExpiry * days}`
    ];

    return headers;
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userCredentials = request.body as UserLoginRequest;
      const loggedUser = await this._authService.loginUser(userCredentials);
      const JWTHeaders = await this.setJWTHeaders(loggedUser.id, reply);
      
      reply.header('set-cookie', JWTHeaders);
      reply.status(200).send(loggedUser as UserProfile); // TODO: map correctly to UserProfile
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

  async logout(reply: FastifyReply) {
    reply.header('set-cookie', [
      `AccessToken=; Secure; SameSite=None; Path=/; max-age=0`,
      `RefreshToken=; HttpOnly; Secure; SameSite=None; Path=/; max-age=0`
    ]);

    return reply.status(200).send({ "success": true });
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userCredentials = request.body as UserRegistrationRequest;
      const registeredUser = await this._authService.registerUser(userCredentials);
      const JWTHeaders = await this.setJWTHeaders(registeredUser.id, reply);
      
      reply.header('set-cookie', JWTHeaders);
      reply.status(200).send({success: true});
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
}
