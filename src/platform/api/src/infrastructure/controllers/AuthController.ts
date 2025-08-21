import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";
import { UserService } from "../../application/services/UserService";
import { UserLoginInfo } from "../../application/models/UserLoginInfo";
import { ErrorMsg, ResponseError } from "../../application/errors/ResponseError";

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
        throw new ResponseError(ErrorMsg.AUTH_INVALID_REFRESH_TOKEN);
      }
      const tokenPayload = decodedToken as JwtPayloadInfo;
      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, '5m');

      reply.header('set-cookie', [
        `AccessToken=${newAccessToken}; Secure; SameSite=None; Path=/`,
      ]);

      reply.status(200).send();
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(401).send({ error: err.message });
      }
      else {
        reply.code(500).send({ error: ErrorMsg.UNKNOWN_SERVER_ERROR })
      }
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = request.body as UserLoginInfo;
      const loggedUser = await this.userService.getUserByUsername(userInfo.username);
      const [accessToken, refreshToken] = await Promise.all([
        JwtAuth.sign(reply, loggedUser as JwtPayloadInfo, '5m'),
        JwtAuth.sign(reply, loggedUser as JwtPayloadInfo, '30d'),
      ]);

      reply.header('set-cookie', [
        `AccessToken=${accessToken}; Secure; SameSite=None; Path=/`,
        `RefreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None; Path=/`
      ]);

      reply.status(200).send();
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(404).send({ error: err.message });
      }
      else {
        reply.code(500).send({ error: ErrorMsg.UNKNOWN_SERVER_ERROR })
      }
    }
  }
}
