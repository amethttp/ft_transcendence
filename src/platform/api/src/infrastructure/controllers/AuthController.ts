import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { JwtAuth } from "../auth/JwtAuth";

export default class AuthController {
  public static async refresh(request: FastifyRequest, reply: FastifyReply, jwt: any) {
    const refreshToken = request.body;

    try {
      console.log(refreshToken);
      const decodedToken = jwt.verify(refreshToken);
      const tokenPayload = decodedToken as JwtPayloadInfo;

      const newAccessToken = await JwtAuth.sign(reply, tokenPayload, '5m');

      reply.send({ success: true, accessToken: newAccessToken });
    } catch (err) {
      reply.status(401).send({ success: false, error: 'Invalid refresh token' });
    }
  }
}
