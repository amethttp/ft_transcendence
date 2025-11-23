import { DownloadData } from "../../domain/entities/DownloadData";
import { User } from "../../domain/entities/User";
import { UserStatus } from "../../domain/entities/UserStatus";
import { IDownloadDataRepository } from "../../domain/repositories/IDownloadDataRepository";
import { IUserStatusRepository } from "../../domain/repositories/IUserStatusRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { UserDownloadDto } from "../models/UserDownloadDto";
import { UserStatusDownloadDto } from "../models/UserStatusDownloadDto";
import { StatusType } from "../models/UserStatusDto";

export class DownloadDataService {
  private _downloadDataRepository: IDownloadDataRepository;
  private _userStatusRespository: IUserStatusRepository;

  constructor(downloadDataRepository: IDownloadDataRepository, userStatusRepository: IUserStatusRepository) {
    this._downloadDataRepository = downloadDataRepository;
    this._userStatusRespository = userStatusRepository;
  }

  private static toUserDownloadDto(user: User): UserDownloadDto {
    const dto: UserDownloadDto = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      birthDate: user.birthDate,
      creationTime: user.creationTime,
      updateTime: user.updateTime,
      auth: {
        id: user.auth.id,
        lastLogin: user.auth.lastLogin,
        password: user.auth.password ? {
          id: user.auth.password.id,
          updateTime: user.auth.password.updateTime
        } : undefined,
        googleAuth: user.auth.googleAuth ? {
          id: user.auth.googleAuth.id,
          googleUserId: user.auth.googleAuth.googleUserid
        } : undefined,
      }
    };

    if (!dto.auth.password) delete dto.auth.password;
    if (!dto.auth.googleAuth) delete dto.auth.googleAuth;
    
    return dto;
  }

  private static toUserStatusDownloadDto(userStatus: UserStatus): UserStatusDownloadDto {
    const dto: UserStatusDownloadDto = {
      status: userStatus.type == StatusType.ONLINE ? 'ONLINE' : 'OFFLINE',
      creationTime: userStatus.creationTime,
      updateTime: userStatus.updateTime
    };
    
    return dto;
  }

  async newDownloadData(inputUser: User, inputToken: string): Promise<DownloadData | null> {
    const downloadDataBlueprint: Partial<DownloadData> = {
      user: inputUser,
      token: inputToken
    };

    const id = await this._downloadDataRepository.create(downloadDataBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const downloadData = await this._downloadDataRepository.findById(id);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return downloadData;
  }

  async getByToken(token: string): Promise<DownloadData> {
    const downloadData = await this._downloadDataRepository.findByToken(token);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return downloadData;
  }

  async getUserDownloadDataByToken(token: string): Promise<UserDownloadDto> {
    const downloadData = await this._downloadDataRepository.findByToken(token);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return DownloadDataService.toUserDownloadDto(downloadData.user);
  }

  async getUserStatusDownloadDataByUserId(userId: number) {
    const userStatus = await this._userStatusRespository.findByUserId(userId);

    if (userStatus == null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return DownloadDataService.toUserStatusDownloadDto(userStatus);
  }

  async deleteByToken(token: string) {
    const data: DownloadData = await this.getByToken(token);
    await this._downloadDataRepository.delete(data.id);
  }

  async eraseAllUserDownloadDatas(user: User) {
    await this._downloadDataRepository.deleteAllByUser(user.id);
  }

  async delete(downloadData: DownloadData) {
    if (!(await this._downloadDataRepository.delete(downloadData.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}