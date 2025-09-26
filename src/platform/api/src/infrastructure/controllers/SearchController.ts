import { FastifyReply, FastifyRequest } from "fastify";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { UserService } from "../../application/services/UserService";
import { Status } from "../../application/models/UserStatusDto";
import { UserProfile } from "../../application/models/UserProfileResponse";
import { Relation } from "../../application/models/RelationInfo";

export default class SearchController {
  private _userService: UserService;

  constructor(userService: UserService) {
    this._userService = userService;
  }

  async findUsers(query: string): Promise<{ users?: UserProfile[] }> {
    const users = await this._userService.getAllByUsername(query);
    const userProfiles: UserProfile[] = [];
    for (const user of users) {
      userProfiles.push({
        username: user.username,
        avatarUrl: user.avatarUrl,
        creationTime: user.creationTime,
        relation: { type: Relation.NO_RELATION, owner: false },
        status: Status.OFFLINE
      });
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
      const query = params.q;
      if (!query) {
        const badRequestErr = new ResponseError(ErrorParams.BAD_REQUEST);
        return reply.code(badRequestErr.code).send(badRequestErr.toDto());
      }
      let results = {};
      const users = await this.findUsers(query);
      return reply.send({ ...users, ...results });
    } catch (error) {
      console.log(error);
      return reply.code(500).send(new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR).toDto())
    }
  }
}
