import { User } from "../entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null> ;
  findByUsername(email: string): Promise<User | null> ;
}