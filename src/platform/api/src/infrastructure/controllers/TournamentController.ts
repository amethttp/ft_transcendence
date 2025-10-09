import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { NewTournamentRequest } from "../../application/models/NewTournamentRequest";
import { TournamentService } from "../../application/services/TournamentService";
import { TournamentPlayerService } from "../../application/services/TournamentPlayerService";
import { UserService } from "../../application/services/UserService";

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

  async getList(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const tournaments = await this._tournamentService.getList();
      reply.send(tournaments);
    }
    catch (err: any) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }
}
