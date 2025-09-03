import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";
import { UserService } from "../../application/services/UserService";
import { UserLoginRequest } from "../../application/models/UserLoginRequest";
import { ErrorMsg, ResponseError } from "../../application/errors/ResponseError";
import { UserProfile } from "../../application/models/UserProfile";
import { UserRegistrationRequest } from "../../application/models/UserRegistrationRequest";
import { AuthService } from "../../application/services/AuthService";

export default class AuthController {
  private _userService: UserService;
  private _authService: AuthService;

  constructor(userService: UserService, authService: AuthService) {
    this._userService = userService;
    this._authService = authService;
  }

  public async refresh(request: FastifyRequest, reply: FastifyReply, jwt: any) {
    const refreshToken = request.cookies.RefreshToken;

    try {
      let decodedToken;
      try {
        decodedToken = jwt.verify(refreshToken);
      } catch (verifyErr) {
        throw new ResponseError(ErrorMsg.AUTH_INVALID_ACCESS);
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
        reply.code(401).send(err.toDto());
      }
      else {
        reply.code(500).send(new ResponseError(ErrorMsg.UNKNOWN_SERVER_ERROR).toDto())
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
      this._authService.validateLoginCredentials(userCredentials); // TODO: Auth service
      const loggedUser = await this._userService.loginUser(userCredentials);
      const JWTHeaders = await this.setJWTHeaders(loggedUser.id, reply);
      
      reply.header('set-cookie', JWTHeaders);
      reply.status(200).send(loggedUser as UserProfile); // TODO: map correctly to UserProfile
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorMsg.UNKNOWN_SERVER_ERROR).toDto())
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
      this._authService.validateRegistrationCredentials(userCredentials);
      const registeredUser = await this._userService.registerUser(userCredentials);
      const JWTHeaders = await this.setJWTHeaders(registeredUser.id, reply);
      
      reply.header('set-cookie', JWTHeaders);
      reply.status(200).send({succes: true});
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send(err.toDto());
      }
      else {
        reply.code(500).send(new ResponseError(ErrorMsg.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }
}
