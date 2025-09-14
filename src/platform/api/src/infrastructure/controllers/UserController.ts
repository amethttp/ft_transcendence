import { type FastifyRequest, type FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { EditUserRequest } from "../../application/models/EditUserRequest";
import { UserVerificationService } from "../../application/services/UserVerificationService";
import { RecoverPasswordService } from "../../application/services/RecoverPasswordService";
import { UserRelationService } from "../../application/services/UserRelationService";

export default class UserController {
  private _userService: UserService;
  private _userVerificationService: UserVerificationService;
  private _userRelationService: UserRelationService;
  private _recoverPasswordService: RecoverPasswordService;


  constructor(userService: UserService, userVerificationService: UserVerificationService, userRelationService: UserRelationService , recoverPasswordService: RecoverPasswordService) {
    this._userService = userService;
    this._userVerificationService = userVerificationService;
    this._userRelationService = userRelationService;
    this._recoverPasswordService = recoverPasswordService;

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
      console.log(err);
      if (err instanceof ResponseError) {
        reply.code(200).send({ success: false });
      }
      else {
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
      if (err instanceof ResponseError) {
        reply.code(err.code).send(err.toDto());
      }
      else {
        console.log(err);
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
}
