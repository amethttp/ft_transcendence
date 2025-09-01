import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";
import { UserService } from "../../application/services/UserService";
import { UserLoginInfo } from "../../application/models/UserLoginInfo";
import { ErrorMsg, ResponseError } from "../../application/errors/ResponseError";
import { UserProfile } from "../../application/models/UserProfile";

export default class AuthController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
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

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = request.body as UserLoginInfo;
      const loggedUser = await this.userService.getUserByIdentifier(userInfo.identifier);
      this.userService.checkPassword(userInfo.password, loggedUser.auth.password?.hash || ""); // TODO: empty "" safe?

      const accessTokenExpiry = 5;
      const refreshTokenExpiry = 30;
      const mins = 60;
      const days = 86400;
      const [accessToken, refreshToken] = await Promise.all([
        JwtAuth.sign(reply, { sub: loggedUser.id } as JwtPayloadInfo, accessTokenExpiry + 'm'),
        JwtAuth.sign(reply, { sub: loggedUser.id } as JwtPayloadInfo, refreshTokenExpiry + 'd'),
      ]);

      reply.header('set-cookie', [
        `AccessToken=${accessToken}; Secure; SameSite=None; Path=/; max-age=${accessTokenExpiry * mins}`,
        `RefreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None; Path=/; max-age=${refreshTokenExpiry * days}`
      ]);

      reply.status(200).send(loggedUser as UserProfile);
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send(err.toDto());
      }
      else {
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
}
