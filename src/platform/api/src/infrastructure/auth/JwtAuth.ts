import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorMsg, ResponseError } from "../../application/errors/ResponseError";

export class JwtAuth {
  public static async validateRequest(request: FastifyRequest, reply: FastifyReply) {
    request.jwtVerify<JwtPayloadInfo>()
      .catch(() => reply.status(401).send({ error: ErrorMsg.AUTH_INVALID_REQUEST }));
  }

  public static async sign(reply: FastifyReply, tokenPayload: JwtPayloadInfo, expirationTime: string) {
    return reply.jwtSign(tokenPayload, { expiresIn: expirationTime })
      .then(token => token)
      .catch(() => { throw new ResponseError(ErrorMsg.AUTH_COULDNT_SIGN_JWT) });
  }
};
