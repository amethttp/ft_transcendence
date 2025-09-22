import { type FastifyRequest, type FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { EditUserRequest } from "../../application/models/EditUserRequest";
import { UserVerificationService } from "../../application/services/UserVerificationService";
import { RecoverPasswordService } from "../../application/services/RecoverPasswordService";
import { UserRelationService } from "../../application/services/UserRelationService";
import path from "path";
import { randomBytes } from "crypto";
import { BusboyFileStream } from "@fastify/busboy";
import { MatchPlayerService } from "../../application/services/MatchPlayerService";
import { TournamentPlayerService } from "../../application/services/TournamentPlayerService";
import { createWriteStream, unlink } from "fs";
import { MatchService } from "../../application/services/MatchService";
import { UserStatsResponse } from "../../application/models/UserStatsResponse";
import { TournamentInfo } from "../../application/models/TournamentInfo";

export default class UserController {
  private _userService: UserService;
  private _userVerificationService: UserVerificationService;
  private _userRelationService: UserRelationService;
  private _recoverPasswordService: RecoverPasswordService;
  private _matchService: MatchService;
  private _matchPlayerService: MatchPlayerService;
  private _tournamentPlayerService: TournamentPlayerService;


  constructor(userService: UserService, userVerificationService: UserVerificationService, userRelationService: UserRelationService, recoverPasswordService: RecoverPasswordService, matchService: MatchService, matchPlayerService: MatchPlayerService, tournamentPlayerService: TournamentPlayerService) {
    this._userService = userService;
    this._userVerificationService = userVerificationService;
    this._userRelationService = userRelationService;
    this._recoverPasswordService = recoverPasswordService;
    this._matchService = matchService;
    this._matchPlayerService = matchPlayerService;
    this._tournamentPlayerService = tournamentPlayerService;
  }

  async getLoggedUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestedUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(requestedUser.sub);
      const loggedUser = UserService.toLoggedUserResponse(user);

      reply.code(200).send(loggedUser);
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async getUserProfile(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      const relationInfo = await this._userRelationService.getRelationInfo(originUser, requestedUser);
      const userProfile = UserService.toUserProfileResponse(requestedUser, relationInfo, true);

      reply.code(200).send(userProfile);
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async getUserStats(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      const game1 = await this._matchService.newLocalMatch("game1");
      const game2 = await this._matchService.newLocalMatch("game2");
      const game3 = await this._matchService.newLocalMatch("game3");
      await this._matchPlayerService.newMatchPlayer(originUser, game1);
      await this._matchPlayerService.newMatchPlayer(requestedUser, game1);
      await this._matchPlayerService.newMatchPlayer(originUser, game2);
      await this._matchPlayerService.newMatchPlayer(requestedUser, game2);
      await this._matchPlayerService.newMatchPlayer(originUser, game3);
      await this._matchPlayerService.newMatchPlayer(requestedUser, game3);
      // console.log(this._matchService);
      
      const matches = await this._matchPlayerService.getAllUserMatchesInfo(requestedUser);
      const tournaments = await this._tournamentPlayerService.getAllUserTournaments(requestedUser);
      const victories = this._matchPlayerService.countWins(matches);
      const tournamentAvg = this._tournamentPlayerService.calculateAvgPlacement(tournaments as any as TournamentInfo[]);
      const stats: UserStatsResponse = {
        last10Matches: matches.slice(-10),
        last10Torunaments: tournaments.slice(-10) as any as TournamentInfo[],
        totalMatches: matches.length,
        matchesWon: victories,
        totalTournaments: tournaments.length,
        tournamentAvg: tournamentAvg,
      }

      reply.code(200).send(stats);
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async checkUsername(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      await this._userService.getByUsername(request.params.username);
      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(200).send({ success: false });
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async checkEmail(request: FastifyRequest<{ Params: { email: string } }>, reply: FastifyReply) {
    try {
      await this._userService.getByEmail(request.params.email);
      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(200).send({ success: false });
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestedUser = request.user as JwtPayloadInfo;
      const requestedUpdates = request.body as EditUserRequest;
      await this._userService.updateUser(requestedUser.sub, requestedUpdates);

      reply.code(200).send({ success: true });
    } catch (err) {
      console.error(err);
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  async eraseAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestedUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(requestedUser.sub);
      await this._userService.erasePersonalInformation(user);
      await this._userVerificationService.eraseAllUserVerifications(user);
      await this._recoverPasswordService.eraseAllUserRecoverPasswords(user); // TODO: Move inside user service inisde begin commit block
      await this._userRelationService.eraseAllUserRelations(user);
      reply.header('set-cookie', [
        `AccessToken=; Secure; SameSite=None; Path=/; max-age=0`,
        `RefreshToken=; HttpOnly; Secure; SameSite=None; Path=/; max-age=0`
      ]);

      reply.code(200).send({ success: true });
    } catch (err) {
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
        reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
      }
    }
  }

  private newFileName(filePath: string, userId: number): string {
    const uniqueId = randomBytes(8).toString('hex');
    const ext = path.extname(filePath);
    return `/uploads/${userId}${uniqueId}${ext}`;
  }

  private _storeFile(file: BusboyFileStream, filePath: string) {
    return new Promise((resolve, reject) => {
      const ws = createWriteStream(process.env.UPLOADS_PATH + filePath);
      file.pipe(ws);
      ws.on('finish', () => resolve(true));
      ws.on('error', reject);
    });
  }

  private _removeFile(path: string) {
    unlink(process.env.UPLOADS_PATH + path, (err) => {
      if (err)
        console.log("error removing file " + path + ": ", err);
    });
  }

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      if (!data || !data.mimetype.startsWith("image/"))
        return reply.code(400).send(new ResponseError(ErrorParams.BAD_REQUEST).toDto());

      const requestedUser = request.user as JwtPayloadInfo;
      const filePath = this.newFileName(data.filename, requestedUser.sub);
      await this._storeFile(data.file, filePath);

      const oldAvatarUrl = (await this._userService.getById(requestedUser.sub)).avatarUrl;
      this._removeFile(oldAvatarUrl);

      await this._userService.updateAvatar(requestedUser.sub, filePath);

      return reply.send({ success: true });
    } catch (error) {
      console.log(error);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }
}
