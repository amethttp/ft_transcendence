import { Transporter } from "nodemailer";
import { User } from "../../domain/entities/User";
import { IUserVerificationRepository } from "../../domain/repositories/IUserVerificationRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";

export class UserVerificationService {
  private _userVerificationRepository: IUserVerificationRepository;

  constructor(userVerificationRepository: IUserVerificationRepository) {
    this._userVerificationRepository = userVerificationRepository;
  }

  async newUserVerification(user: User): Promise<number | undefined> {
    const attempts = 0;
    const code = Math.floor(100000 + Math.random() * 900000);
    const id = await this._userVerificationRepository.create({ user: user, code: code, attempts: attempts });
    return (await this._userVerificationRepository.findById(id || -1))?.code;
  }

  async verify(userId: number, code: number): Promise<boolean> {
    const userVerification = await this._userVerificationRepository.findByUserIdAndCode(userId, code); 
    if (userVerification !== null) {
      if (userVerification.attempts > 9) {
        await this._userVerificationRepository.delete(userVerification.id);
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }
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
}