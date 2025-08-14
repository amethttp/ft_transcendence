import { AEntity } from "./AEntity";

export class Auth extends AEntity {
  static readonly tableName = "auth";
  id!: number;
  lastLogin!: Date;
  googleAuthPH?: number;
  password?: string;
}
