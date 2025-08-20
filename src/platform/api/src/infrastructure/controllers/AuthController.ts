import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";

export default class AuthController {
  public static async refresh(request: FastifyRequest, reply: FastifyReply, jwt: any) {
    const refreshToken = request.cookies.RefreshToken;

    try {
      const decodedToken = jwt.verify(refreshToken);
      const tokenPayload = decodedToken as JwtPayloadInfo;

      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, '5m');

      reply.header('set-cookie', [
        `AccessToken=${newAccessToken}; Secure; SameSite=None; Path=/`,
      ]);

      reply.send({ success: true });
    } catch (err) {
      reply.status(401).send({ success: false, error: 'Invalid refresh token' });
    }
  }
}
