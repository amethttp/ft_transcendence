import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";
import { UserService } from "../../application/services/UserService";
import { SQLiteUserRepository } from "../repositories/sqlite/SQLiteUserRepository";
import { UserLoginInfo } from "../../application/models/UserLoginInfo";

export default class AuthController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async refresh(request: FastifyRequest, reply: FastifyReply, jwt: any) {
    const refreshToken = request.cookies.RefreshToken;

    try {
      const decodedToken = jwt.verify(refreshToken);
      const tokenPayload = decodedToken as JwtPayloadInfo;
      const accessTokenExpiry = 5;
      const mins = 60;

      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, accessTokenExpiry + 'm');

      reply.header('set-cookie', [
        `AccessToken=${newAccessToken}; Secure; SameSite=None; Path=/; max-age=${accessTokenExpiry * mins}`,
      ]);

      reply.send({ success: true });
    } catch (err) {
      reply.status(401).send({ success: false, error: 'Invalid refresh token' });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const userInfo = request.body as UserLoginInfo;

    return this.userService.getUserByUsername(userInfo.username)
      .then(async user => {
        const accessTokenExpiry = 5;
        const refreshTokenExpiry = 30;
        const mins = 60;
        const days = 86400;
        const [accessToken, refreshToken] = await Promise.all([
          JwtAuth.sign(reply, user as JwtPayloadInfo, accessTokenExpiry + 'm'),
          JwtAuth.sign(reply, user as JwtPayloadInfo, '30d'),
        ]);

        reply.header('set-cookie', [
          `AccessToken=${accessToken}; Secure; SameSite=None; Path=/; max-age=${accessTokenExpiry * mins}`,
          `RefreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None; Path=/; max-age=${refreshTokenExpiry * days}`
        ]);

        return reply.status(200).send({ "success": true });
      })
      .catch(error => reply.status(404).send({ "success": false, "error": error }));
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.header('set-cookie', [
      `AccessToken=; Secure; SameSite=None; Path=/; max-age=0`,
      `RefreshToken=; HttpOnly; Secure; SameSite=None; Path=/; max-age=0`
    ]);

    return reply.status(200).send({ "success": true });
  }
}
