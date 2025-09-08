import { User } from "../../domain/entities/User";
import { IUserVerificationRepository } from "../../domain/repositories/IUserVerificationRepository";

export class UserVerificationService {
  private _userVerificationRepository: IUserVerificationRepository;

  constructor(userVerificationRepository: IUserVerificationRepository) {
    this._userVerificationRepository = userVerificationRepository;
  }

  async createUserVerification(user: User): Promise<number | undefined> {
    const code = Math.floor(1000 + Math.random() * 9000);
    const id = await this._userVerificationRepository.create({ user: user, code: code });
    return (await this._userVerificationRepository.findById(id || -1))?.code;
  }

  async verify(userId: number, code: number): Promise<boolean> {
    const userVerification = await this._userVerificationRepository.findByUserIdAndCode(userId, code);
    if (userVerification !== null) {
      this._userVerificationRepository.delete(userVerification.id);
      return true;
    }
    return false;
  }
}