import { User } from "../entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null> ;
  findByUsername(email: string): Promise<User | null> ;
}