import { UserService } from "../../application/services/UserService";
import { MatchService } from "../../application/services/MatchService";
import { MatchPlayerService } from "../../application/services/MatchPlayerService";
import { FastifyReply, FastifyRequest } from "fastify";
import { NewMatchRequest } from "../../application/models/NewMatchRequest";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";

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
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }

  async joinMatch(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const match = await this._matchService.getByToken(request.params.token);
      if (match && match.players.length < 2 && !match.players.find(player => player.user.id === originUser.id)) {
        const newPlayer: any = await this._matchPlayerService.newMatchPlayer(originUser, match);
        delete newPlayer.user.auth;
        match.players.push(newPlayer);
      }
      else if (!match) {
        return reply.code(404).send("");
      }
      reply.send(match);
    } catch (error: any) {
      console.log(error);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }

  async getPlayer(request: FastifyRequest<{ Querystring: { userId: number, matchId: number } }>, reply: FastifyReply) {
    try {
      if (!request.query.userId || request.query.userId < 0)
        throw new ResponseError(ErrorParams.BAD_REQUEST);
      const player = await this._matchPlayerService.getByUserAndMatch(request.query.userId, request.query.matchId);
      return reply.send(player);
    } catch (error: any) {
      if (error instanceof ResponseError)
        reply.code(error.code).send(error.toDto());
      else {
        console.log(error);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
      }
    }
  }

  async getList(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const matches = await this._matchService.getPublic();
      reply.send(matches);
    }
    catch (err: any) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }
}
