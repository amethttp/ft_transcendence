import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { UserService } from "../../application/services/UserService";
import { UserProfile } from "../../application/models/UserProfile";
import { User } from "../../domain/entities/User";
import { JwtPayloadInfo } from "../../application/models/JwtPayloadInfo";
import UserController from "./UserController";

export default class SearchController {
  private _userService: UserService;
  private _userController: UserController;
  
  constructor(userService: UserService, userController: UserController) {
    this._userService = userService;
    this._userController = userController;
  }

  async findUsers(query: string, originUser: User): Promise<{ users?: UserProfile[] }> {
    const users = await this._userService.getAllByUsername(query.trim());
    const userProfiles: UserProfile[] = [];
    for (const user of users) {
      userProfiles.push(await this._userController.toUserProfile(originUser, user));
    }
    if (userProfiles.length > 0) {
      return { users: userProfiles }
    }
    else
      return {};
  }

  async searchResults(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.query as Record<string, string>;
      const jwtUser = request.user as JwtPayloadInfo;
      const originUser = await this._userService.getById(jwtUser.sub);
      const query = params.q;
      if (!query) {
        const badRequestErr = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(badRequestErr.code).send(badRequestErr.toDto());
      }
      let results = {};
      const users = await this.findUsers(query, originUser);
      return reply.send({ ...users, ...results });
    } catch (error) {
      console.log(error);
      return reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }
}
