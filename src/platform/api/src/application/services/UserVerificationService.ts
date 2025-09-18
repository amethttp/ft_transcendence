import { Transporter } from "nodemailer";
import { User } from "../../domain/entities/User";
import { IUserVerificationRepository } from "../../domain/repositories/IUserVerificationRepository";
import { UserVerification } from "../../domain/entities/UserVerification";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

export class UserVerificationService {
  private _userVerificationRepository: IUserVerificationRepository;

  constructor(userVerificationRepository: IUserVerificationRepository) {
    this._userVerificationRepository = userVerificationRepository;
  }

  async newUserVerification(user: User): Promise<UserVerification> {
    const code = Math.floor(100000 + Math.random() * 900000);
    const userVerificationBlueprint: Partial<UserVerification> = {
      user: user,
      code: code,
    };

    const id = await this._userVerificationRepository.create(userVerificationBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
    const userVerification = await this._userVerificationRepository.findById(id);
    if (userVerification === null) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }

    return userVerification;
  }

  async verifyAndDelete(userId: number, code: number): Promise<boolean> {
    const userVerification = await this._userVerificationRepository.findByUserIdAndCode(userId, code);
    if (userVerification !== null) {
      await this._userVerificationRepository.delete(userVerification.id);
      return true;
    }
    return false;
  }

  async sendVerificationCode(mailer: Transporter, email: string, code: number) {
    mailer.sendMail({
      from: '"AmethPong" <info@amethpong.fun>',
      to: email,
      subject: "Verification code",
      text: "Your code is: " + code,
    });
  }

  async eraseAllUserVerifications(user: User) {
    await this._userVerificationRepository.deleteAllByUser(user.id);
  }

  async delete(userVerification: UserVerification) {
    if (!(await this._userVerificationRepository.delete(userVerification.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}