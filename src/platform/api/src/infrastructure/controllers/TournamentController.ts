import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { NewTournamentRequest } from "../../application/models/NewTournamentRequest";
import { TournamentService } from "../../application/services/TournamentService";
import { TournamentPlayerService } from "../../application/services/TournamentPlayerService";
import { UserService } from "../../application/services/UserService";
import { Tournament, TournamentState } from "../../domain/entities/Tournament";
import { TournamentMinified } from "../../application/models/TournamentMinified";
import { TournamentRoundService } from "../../application/services/TournamentRoundService";
import { MatchService } from "../../application/services/MatchService";
import { MatchPlayerService } from "../../application/services/MatchPlayerService";
import { NewMatchRequest } from "../../application/models/NewMatchRequest";
import { User } from "../../domain/entities/User";

export default class TournamentController {
  private _userService: UserService;
  private _tournamentService: TournamentService;
  private _tournamentPlayerService: TournamentPlayerService;
  private _tournamentRoundService: TournamentRoundService;
  private _matchService: MatchService;
  private _matchPlayerService: MatchPlayerService;

  constructor(userService: UserService, tournamentService: TournamentService, tournamentPlayerService: TournamentPlayerService, tournamentRoundService: TournamentRoundService, matchService: MatchService, matchPlayerService: MatchPlayerService) {
    this._userService = userService;
    this._tournamentService = tournamentService;
    this._tournamentPlayerService = tournamentPlayerService;
    this._tournamentRoundService = tournamentRoundService;
    this._matchService = matchService;
    this._matchPlayerService = matchPlayerService;
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
        });
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

  async start(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      if (!request.params.token) {
        const err = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(err.code).send(err.toDto());
      }
      const tournament = await this._tournamentService.getByToken(request.params.token);
      if (tournament.state === TournamentState.WAITING && tournament.players.length === tournament.playersAmount) {
        const jwtUser = request.user as JwtPayloadInfo;
        const player = tournament.players.find(player => player.user.id === jwtUser.sub);
        if (player && tournament.players[0] === player) {
          await this._tournamentService.start(tournament);
          await this._createRound(tournament);
          return reply.send({ success: true });
        }
        else {
          throw new ResponseError(ErrorParams.UNAUTHORIZED_USER_ACTION);
        }
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

  private async _createRound(tournament: Tournament) {
    const activePlayers = tournament.players.filter(player => player.round === tournament.round);
    const round = await this._tournamentRoundService.create(activePlayers.length.toString(), tournament);
    for (let i = 0; i < activePlayers.length; i += 2) {
      const matchRequest: NewMatchRequest = {
        name: `${tournament.name} - round of ${round.top}`,
        points: tournament.points,
        tournamentRound: round,
        isVisible: false
      }
      const match = await this._matchService.newMatch(matchRequest);
      await this._matchPlayerService.newMatchPlayer(activePlayers[i].user, match);
      if (activePlayers[i + 1])
        await this._matchPlayerService.newMatchPlayer(activePlayers[i + 1].user, match);
    }
  }

  async fill(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      if (!request.params.token) {
        const err = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(err.code).send(err.toDto());
      }
      const tournament = await this._tournamentService.getByToken(request.params.token);
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      if (tournament.players.length < tournament.playersAmount) {
        await this.fillAllPlayers(tournament, originUser);
      }
      await this._tournamentService.start(tournament);
      await this.createRounds(tournament);
      this._tournamentService.update(tournament.id, tournament);
      return reply.send({ success: true });
    }
    catch (err: any) {
      console.log(err);
      if (err instanceof ResponseError)
        reply.code(err.code).send(err.toDto());
      else
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }

  async fillAllPlayers(tournament: Tournament, originUser: User) {
    const players = [];
    for (let i = tournament.players.length; i < tournament.playersAmount; i++) {
      players.push(await this._tournamentPlayerService.newTournamentPlayer(originUser, tournament));
    }
    tournament.players = [...tournament.players, ...players];
  }

  async createRounds(tournament: Tournament) {
    const maxRounds = Math.log2(tournament.players.length);
    let alivePlayers = tournament.players;
    while (tournament.round < maxRounds) {
      await this._tournamentPlayerService.updateMultiple(alivePlayers, {round: tournament.round});
      await this._createRound(tournament);
      tournament.round++;
      alivePlayers = alivePlayers.filter( player => {
        const index = alivePlayers.indexOf(player);
        return index % 2 === 0;
      });
    }
    tournament.round--;
  }
}
