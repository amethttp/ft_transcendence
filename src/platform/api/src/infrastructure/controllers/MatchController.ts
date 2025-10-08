import { UserService } from "../../application/services/UserService";
import { MatchService } from "../../application/services/MatchService";
import { MatchPlayerService } from "../../application/services/MatchPlayerService";
import { FastifyReply, FastifyRequest } from "fastify";
import { NewMatchRequest } from "../../application/models/NewMatchRequest";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { Match } from "../../domain/entities/Match";

export default class MatchController {
  private _matchService: MatchService;
  private _matchPlayerService: MatchPlayerService;
  private _userService: UserService;

  constructor(matchService: MatchService, matchPlayerService: MatchPlayerService, userService: UserService) {
    this._matchService = matchService;
    this._matchPlayerService = matchPlayerService;
    this._userService = userService;
  }

  async newMatch(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body: NewMatchRequest = request.body as NewMatchRequest;
      if (body.points < 2 || body.points > 100) {
        const error = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(error.code).send(error.toDto());
      }
      else {
        const jwtUser = request.user as JwtPayloadInfo;
        const originUser = await this._userService.getById(jwtUser.sub);
        const match = await this._matchService.newMatch(body);
        await this._matchPlayerService.newMatchPlayer(originUser, match);
        reply.send({ token: match.token });
      }
    }
    catch (err: any) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }

  async joinMatch(request: FastifyRequest, reply: FastifyReply) {
    const jwtUser = request.user as JwtPayloadInfo;
    const originUser = await this._userService.getById(jwtUser.sub);
    await this._matchPlayerService.newMatchPlayer(originUser, new Match());
    reply.send(new Match());
  }

  async getList(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const matches = await this._matchService.getPublic();
      reply.send(matches);
    }
    catch (err: any) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }
}
