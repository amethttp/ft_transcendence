import { UserVerification } from "../entities/UserVerification";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserVerificationRepository extends IBaseRepository<UserVerification> {
  findByUserIdAndCode(id: number, code: number): Promise<UserVerification | null>;
}
