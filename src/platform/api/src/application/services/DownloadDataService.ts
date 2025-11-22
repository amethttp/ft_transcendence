import { DownloadData } from "../../domain/entities/DownloadData";
import { User } from "../../domain/entities/User";
import { IDownloadDataRepository } from "../../domain/repositories/IDownloadDataRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { UserDownloadDto } from "../models/UserDownloadDto";

export class DownloadDataService {
  private _downloadDataRepository: IDownloadDataRepository;

  constructor(downloadDataRepository: IDownloadDataRepository) {
    this._downloadDataRepository = downloadDataRepository;
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

  async getUserByToken(token: string): Promise<UserDownloadDto> {
    const downloadData = await this._downloadDataRepository.findByToken(token);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return DownloadDataService.toUserDownloadDto(downloadData.user);
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