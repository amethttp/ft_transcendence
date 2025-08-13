import { AEntity } from "./AEntity";
import { Auth } from "./Auth";

export class User extends AEntity {
  static readonly tableName = "user";
  id!: number;
  email!: string;
  username!: string;
  avatarUrl!: string;
  creationTime!: Date;
  updateTime!: Date;
  auth!: Auth;
}
