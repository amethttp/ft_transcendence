import { GoogleAuth } from "../entities/GoogleAuth";
import { IBaseRepository } from "./IBaseRepository";

export interface IGoogleAuthRepository extends IBaseRepository<GoogleAuth> {
  findByGoogleUserId(googleUserId: string): Promise<GoogleAuth | null>;
}
