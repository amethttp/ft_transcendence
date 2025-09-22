import { UserStatus } from "../../domain/entities/UserStatus";
import { IUserStatusRepository } from "../../domain/repositories/IUserStatusRepository";
import { Status, StatusInfo, StatusType } from "../models/StatusInfo";

export class UserStatusService {
  private _userStatusRepository: IUserStatusRepository;

  private static toStatusInfo(userStatus: UserStatus): StatusInfo {
    const statusInfo: StatusInfo = {
      userId: userStatus.id,
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
}
