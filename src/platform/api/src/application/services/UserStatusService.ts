import { IUserStatusRepository } from "../../domain/repositories/IUserStatusRepository";

export class UserStatusService {
  private _userStatusRepository: IUserStatusRepository;

  constructor(userStatusRepository: IUserStatusRepository) {
    this._userStatusRepository = userStatusRepository;
  }

  async getUserConnectionStatus(userId: number) {
    this._userStatusRepository.findByUserId(userId);
  }
}
