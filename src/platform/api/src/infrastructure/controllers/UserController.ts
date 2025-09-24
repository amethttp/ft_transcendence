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
import { createWriteStream, unlink } from "fs";
import { BusboyFileStream } from "@fastify/busboy";
import { DownloadDataService } from "../../application/services/DownloadDataService";
import { Transporter } from "nodemailer";

export default class UserController {
  private _userService: UserService;
  private _userVerificationService: UserVerificationService;
  private _userRelationService: UserRelationService;
  private _recoverPasswordService: RecoverPasswordService;
  private _downloadDataService: DownloadDataService;


  constructor(userService: UserService, userVerificationService: UserVerificationService, userRelationService: UserRelationService, recoverPasswordService: RecoverPasswordService, downloadDataService: DownloadDataService) {
    this._userService = userService;
    this._userVerificationService = userVerificationService;
    this._userRelationService = userRelationService;
    this._recoverPasswordService = recoverPasswordService;
    this._downloadDataService = downloadDataService;
  }

  async getLoggedUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const requestedUser = request.user as JwtPayloadInfo;
      const user = await this._userService.getById(requestedUser.sub);
      const loggedUser = this._userService.toLoggedUserResponse(user);

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
      const user = await this._userService.getByUsername(request.params.username);
      const userProfile = this._userService.toUserProfileResponse(user);

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
        `AccessToken=; Secure; SameSite=None; Path=/; max-age=0`,
        `RefreshToken=; HttpOnly; Secure; SameSite=None; Path=/; max-age=0`
      ]);

      reply.code(200).send({ success: true }); // TODO: remove jwt access ...
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
      html: `Click here to download your data: <a href="http://localhost:5173/user/download/${token} target="_blank">http://localhost:5173/user/download/${token}</a>`
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
