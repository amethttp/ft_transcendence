import { User } from "../../domain/entities/User";
import { UserStatus } from "../../domain/entities/UserStatus";
import { IUserStatusRepository } from "../../domain/repositories/IUserStatusRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { Status, StatusInfo, StatusType } from "../models/StatusInfo";

export class UserStatusService {
  private _userStatusRepository: IUserStatusRepository;

  private static toStatusInfo(userStatus: UserStatus): StatusInfo {
    const statusInfo: StatusInfo = {
      userId: userStatus.user.id,
      value: userStatus.type as StatusType
    };

    return statusInfo;
  }

  constructor(userStatusRepository: IUserStatusRepository) {
    this._userStatusRepository = userStatusRepository;
  }

  async getUserConnectionStatus(userId: number): Promise<StatusInfo> {
    const result: StatusInfo = { userId: -1, value: Status.OFFLINE }
    const userStatus = await this._userStatusRepository.findByUserId(userId);

    if (userStatus === null)
      return result;

    return UserStatusService.toStatusInfo(userStatus);
  }

  async createUserConnectionStatus(user: User): Promise<UserStatus> {
    const userStatusBlueprint: Partial<UserStatus> = {
      type: Status.OFFLINE,
      user: user
    }

    const userStatusId = await this._userStatusRepository.create(userStatusBlueprint);
    if (userStatusId === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const createdUserStatus = await this._userStatusRepository.findById(userStatusId);
    if (createdUserStatus === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return createdUserStatus;
  }
}
