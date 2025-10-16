import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { NewTournamentRequest } from "../../application/models/NewTournamentRequest";
import { TournamentService } from "../../application/services/TournamentService";
import { TournamentPlayerService } from "../../application/services/TournamentPlayerService";
import { UserService } from "../../application/services/UserService";
import { TournamentState } from "../../domain/entities/Tournament";
import { TournamentMinified } from "../../application/models/TournamentMinified";

export default class TournamentController {
  private _userService: UserService;
  private _tournamentService: TournamentService;
  private _tournamentPlayerService: TournamentPlayerService;

  constructor(userService: UserService, tournamentService: TournamentService, tournamentPlayerService: TournamentPlayerService) {
    this._userService = userService;
    this._tournamentService = tournamentService;
    this._tournamentPlayerService = tournamentPlayerService;
  }

  async newTournament(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body: NewTournamentRequest = request.body as NewTournamentRequest;
      if (body.points < 2 || body.points > 100 || body.playersAmount < 4 || body.playersAmount > 64 || body.name.length < 2) {
        const error = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(error.code).send(error.toDto());
      }
      else {
        const jwtUser = request.user as JwtPayloadInfo;
        const originUser = await this._userService.getById(jwtUser.sub);
        const tournament = await this._tournamentService.newTournament(body);
        await this._tournamentPlayerService.newTournamentPlayer(originUser, tournament);
        reply.send({ token: tournament.token });
      }
    }
    catch (err: any) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
      }
    }
  }

  async getList(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournaments = await this._tournamentService.getList();
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const myTournaments = await this._tournamentPlayerService.getAllUserTournaments(originUser);
      const myTournamentsFiltered = myTournaments
        .filter(tournament => tournament.state === TournamentState.IN_PROGRESS
          || tournament.state === TournamentState.WAITING)
        .map((tournament): TournamentMinified => {
          return {
            name: tournament.name,
            token: tournament.token,
            creationTime: tournament.creationTime,
            points: tournament.points,
            players: -1,
            playersAmount: tournament.playersAmount,
          }
        })
      reply.send([...myTournamentsFiltered, ...tournaments.filter(t => !myTournamentsFiltered.find(tt => t.token === tt.token))]);
    }
    catch (err: any) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }

  async getByToken(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      if (!request.params.token) {
        const err = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(err.code).send(err.toDto());
      }
      const tournament = await this._tournamentService.getByToken(request.params.token);
      reply.send(tournament);
    }
    catch (err: any) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }

  async join(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      if (!request.params.token) {
        const err = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(err.code).send(err.toDto());
      }
      const tournament = await this._tournamentService.getByToken(request.params.token);
      if (tournament.players.length < tournament.playersAmount) {
        const jwtUser = request.user as JwtPayloadInfo;
        const originUser = await this._userService.getById(jwtUser.sub);
        await this._tournamentPlayerService.newTournamentPlayer(originUser, tournament);
        return reply.send({ success: true });
      }
      else {
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
      }
    }
    catch (err: any) {
      console.log(err);
      if (err instanceof ResponseError)
        reply.code(err.code).send(err.toDto());
      else
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }

  async leave(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      if (!request.params.token) {
        const err = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(err.code).send(err.toDto());
      }
      const tournament = await this._tournamentService.getByToken(request.params.token);
      if (tournament.state === TournamentState.WAITING) {
        const jwtUser = request.user as JwtPayloadInfo;
        const player = tournament.players.find(player => player.user.id === jwtUser.sub);
        if (player)
          await this._tournamentPlayerService.delete(player);
        return reply.send({ success: true });
      }
      else {
        throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
      }
    }
    catch (err: any) {
      console.log(err);
      if (err instanceof ResponseError)
        reply.code(err.code).send(err.toDto());
      else
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }
}
