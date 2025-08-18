import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { User } from "../../domain/entities/User";

export class JwtAuth {
  public static async validateRequest(request: FastifyRequest, reply: FastifyReply) {
    request.jwtVerify<JwtPayloadInfo>()
      .catch(error => reply.status(401).send({ 'success': false, 'error': error}));
  }

  public static async sendReplyWithToken(reply: FastifyReply, user: User) {
    const jwtPayload = user as JwtPayloadInfo;

    return reply.jwtSign(jwtPayload, { expiresIn: '1h' })
      .then(token => reply.status(200).send({ "success": true, "token": token}))
      .catch(error => reply.status(500).send({ "success": false, "error": error }));
  }
};
