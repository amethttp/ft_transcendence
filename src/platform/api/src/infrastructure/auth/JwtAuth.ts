import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";

export class JwtAuth {
  public static async validateRequest(request: FastifyRequest, reply: FastifyReply) {
    request.jwtVerify<JwtPayloadInfo>()
      .catch(error => reply.status(401).send({ 'success': false, 'error': error}));
  }
};
