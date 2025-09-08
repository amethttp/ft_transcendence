import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";

export class JwtAuth {
  public static async validateRequest(request: FastifyRequest, reply: FastifyReply) {
    request.jwtVerify<JwtPayloadInfo>()
      .catch(() => reply.status(401).send(new ResponseError(ErrorParams.AUTH_EXPIRED_ACCESS).toDto()));
  }

  public static async sign(reply: FastifyReply, tokenPayload: JwtPayloadInfo, expirationTime: string) {
    return reply.jwtSign(tokenPayload, { expiresIn: expirationTime })
      .then(token => token)
      .catch(() => { throw new ResponseError(ErrorParams.AUTH_INVALID_ACCESS) });
  }
};
