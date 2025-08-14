import { Auth } from "../entities/Auth";
import { IBaseRepository } from "./IBaseRepository";

export interface IAuthRepository extends IBaseRepository<Auth> {
  //* specific entity methods here *//
}