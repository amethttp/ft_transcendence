import { DownloadData } from "../../domain/entities/DownloadData";
import { User } from "../../domain/entities/User";
import { IDownloadDataRepository } from "../../domain/repositories/IDownloadDataRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

export class DownloadDataService {
  private _downloadDataRepository: IDownloadDataRepository;

  constructor(downloadDataRepository: IDownloadDataRepository) {
    this._downloadDataRepository = downloadDataRepository;
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
      throw new ResponseError(ErrorParams.PASSWORD_RECOVER_FAILED);
    }

    return downloadData;
  }

  async getUserByToken(token: string): Promise<User> {
    const downloadData = await this._downloadDataRepository.findByToken(token);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.PASSWORD_RECOVER_FAILED);
    }
    const user = downloadData.user;

    delete user.auth.password?.hash;
    delete user.auth.googleAuth?.accessToken;
    delete user.auth.googleAuth?.refreshToken;
    delete user.auth.googleAuth?.tokenType;
    delete user.auth.googleAuth?.expirationTime;
    delete user.auth.googleAuth?.scope;
    delete user.auth.googleAuth?.creationTime;
    delete user.auth.googleAuth?.updateTime;

    return user;
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