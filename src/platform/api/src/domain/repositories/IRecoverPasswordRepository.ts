import { RecoverPassword } from "../entities/RecoverPassword";
import { IBaseRepository } from "./IBaseRepository";

export interface IRecoverPasswordRepository extends IBaseRepository<RecoverPassword> {
  findByToken(token: string): Promise<RecoverPassword | null>;
}
