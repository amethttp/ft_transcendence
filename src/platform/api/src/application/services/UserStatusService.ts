import { User } from "../../domain/entities/User";
import { UserStatus } from "../../domain/entities/UserStatus";
import { IUserStatusRepository } from "../../domain/repositories/IUserStatusRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { Status, UserStatusDto, StatusType } from "../models/UserStatusDto";

export class UserStatusService {
  private _userStatusRepository: IUserStatusRepository;

  private static toUserStatusDto(userStatus: UserStatus): UserStatusDto {
    const userStatusDto: UserStatusDto = {
      userId: userStatus.user.id,
      value: userStatus.type as StatusType
    };

    return userStatusDto;
  }

  constructor(userStatusRepository: IUserStatusRepository) {
    this._userStatusRepository = userStatusRepository;
  }

  async getUserConnectionStatus(userId: number): Promise<UserStatusDto> {
    const result: UserStatusDto = { userId: userId, value: Status.OFFLINE }
    const userStatus = await this._userStatusRepository.findByUserId(userId);

    if (userStatus === null)
      return result;

    return UserStatusService.toUserStatusDto(userStatus);
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

  async setUserStatus(user: User, newStatus: StatusType) {
    const userStatusBlueprint: Partial<UserStatus> = {
      type: newStatus,
      user: user,
    };

    if (!await this._userStatusRepository.update(user.id, userStatusBlueprint)) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
