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
import { TournamentService } from "../../application/services/TournamentService";
import { UserStatusService } from "../../application/services/UserStatusService";
import { DownloadDataService } from "../../application/services/DownloadDataService";
import { Transporter } from "nodemailer";
import { User } from "../../domain/entities/User";
import { UserProfile } from "../../application/models/UserProfile";
import { RelationType } from "../../application/models/Relation";
import { StatusType, UserStatusDto } from "../../application/models/UserStatusDto";

export default class UserController {
  private _userService: UserService;
  private _userVerificationService: UserVerificationService;
  private _userRelationService: UserRelationService;
  private _recoverPasswordService: RecoverPasswordService;
  private _matchService: MatchService;
  private _matchPlayerService: MatchPlayerService;
  private _tournamentService: TournamentService;
  private _tournamentPlayerService: TournamentPlayerService;
  private _userStatusService: UserStatusService;
  private _downloadDataService: DownloadDataService;


  constructor(userService: UserService, userVerificationService: UserVerificationService, userRelationService: UserRelationService, recoverPasswordService: RecoverPasswordService, userStatusService: UserStatusService, downloadDataService: DownloadDataService, matchService: MatchService, matchPlayerService: MatchPlayerService, tournamentService: TournamentService, tournamentPlayerService: TournamentPlayerService) {
    this._userService = userService;
    this._userVerificationService = userVerificationService;
    this._userRelationService = userRelationService;
    this._recoverPasswordService = recoverPasswordService;
    this._matchService = matchService;
    this._matchPlayerService = matchPlayerService;
    this._tournamentService = tournamentService;
    this._tournamentPlayerService = tournamentPlayerService;    this._userStatusService = userStatusService;
    this._downloadDataService = downloadDataService;
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

  async toUserProfile(originUser: User, user: User): Promise<UserProfile> {
    const relation = await this._userRelationService.getRelation(originUser, user);
    let status: UserStatusDto;
    if (relation.type === RelationType.FRIENDSHIP_ACCEPTED)
      status = await this._userStatusService.getUserConnectionStatus(user.id);
    else 
      status = {userId: user.id, value: StatusType.OFFLINE};
    return UserService.toUserProfile(user, relation, status.value);
  }

  async getUserProfile(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);
      const userProfile = await this.toUserProfile(originUser, requestedUser);

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

  async createMatch(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
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

  async createTournament(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const tournament1 = await this._tournamentService.newPublicTournament("tournament1", "XXXXXXX", 16);
      const tournament2 = await this._tournamentService.newPublicTournament("tournament2", "XXXXXXX", 16);
      const tournament3 = await this._tournamentService.newPublicTournament("tournament3", "XXXXXXX", 16);
      await this._tournamentPlayerService.newTournamentPlayer(originUser, tournament1, 1);
      await this._tournamentPlayerService.newTournamentPlayer(originUser, tournament2, 4);
      await this._tournamentPlayerService.newTournamentPlayer(originUser, tournament3, 8);

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

  async getUserStats(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
    try {
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const requestedUser = await this._userService.getByUsername(request.params.username);

      let stats: UserStatsResponse;
      const relation = await this._userRelationService.getRelation(originUser, requestedUser);
      if (relation.type === RelationType.BLOCKED) {
        stats = {
          last10Matches: [],
          last10Tournaments: [],
          totalMatches: 0,
          victories: 0,
          totalTournaments: 0,
          tournamentAvg: 0,
        }
      } else {
        const matches = await this._matchPlayerService.getAllUserMatchesInfo(requestedUser);
        const tournaments = await this._tournamentPlayerService.getAllUserTournamentsInfo(requestedUser);
        const victories = this._matchPlayerService.countWins(matches);
        const tournamentAvg = this._tournamentPlayerService.calculateAvgPlacement(tournaments);
        stats = {
          last10Matches: matches.slice(-10).reverse(),
          last10Tournaments: tournaments.slice(-10).reverse(),
          totalMatches: matches.length,
          victories: victories,
          totalTournaments: tournaments.length,
          tournamentAvg: tournamentAvg,
        }
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
      if (!user.avatarUrl.endsWith("default-avatar.webp"))
        this._removeFile(user.avatarUrl);
      reply.header('set-cookie', [
        `AccessToken=; Secure; SameSite=Strict; Path=/; max-age=0`,
        `RefreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; max-age=0`
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
      if (!oldAvatarUrl.endsWith("default-avatar.webp"))
        this._removeFile(oldAvatarUrl);

      await this._userService.updateAvatar(requestedUser.sub, filePath);

      return reply.send({ success: true });
    } catch (error) {
      console.log(error);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }

  async downloadData(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      const token = request.params.token;
      const userData = await this._downloadDataService.getUserByTokenAndDeleteRecover(token);
      delete userData.auth.password;
      delete userData.auth.googleAuth;
      const data = { ...userData }; // TODO: Add games, tournaments, etc...

      reply.header("Content-Type", "application/json")
        .header("Content-Disposition", `attachment; filename=${userData.username}-amethpong.json`)
        .send(JSON.stringify(data, null, 2));
    } catch (err) {
      reply.code(404).send();
    }
  }

  private _sendDownloadDataEmail(mailer: Transporter, email: string, token: string) {
    mailer.sendMail({
      from: '"AmethPong" <info@amethpong.fun>',
      to: email,
      subject: "Download your data",
      html: `Click here to download your data: <a href="${process.env.CLIENT_HOST}/user/download/${token} target="_blank">${process.env.CLIENT_HOST}/user/download/${token}</a>`
    });
  }

  async requestDownloadData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestedUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(requestedUser.sub);
      const token = randomBytes(32).toString("base64url");
      await this._downloadDataService.newDownloadData(user, token);

      this._sendDownloadDataEmail(request.server.mailer, user.email, token);
      reply.status(200).send({ success: true });
    } catch (err) {
      console.log(err);
      reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto());
    }
  }
}
