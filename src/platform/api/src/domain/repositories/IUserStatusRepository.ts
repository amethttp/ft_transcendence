import { UserStatus } from "../entities/UserStatus";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserStatusRepository extends IBaseRepository<UserStatus> {
  findByUserId(id: number): Promise<UserStatus | null>
}
