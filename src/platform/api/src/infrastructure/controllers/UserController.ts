import { type FastifyRequest, type FastifyReply } from "fastify";
import { UserService } from "../../application/services/UserService";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { EditUserRequest } from "../../application/models/EditUserRequest";

export default class UserController {
  private _userService: UserService;

  constructor(userService: UserService) {
    this._userService = userService;
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
      await this._userService.deleteUser(requestedUser.sub);

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
}
