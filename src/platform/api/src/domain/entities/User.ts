import { AEntity } from "./AEntity";
import { Auth } from "./Auth";

const userSchema: Record<string, string> = {
  email: "email",
  username: "username",
  avatarUrl: "avatar_url",
  auth: "auth_id",
  creationTime: "creation_time",
  updateTime: "update_time",
};

export class User extends AEntity {
  static readonly tableName = "user";
  static readonly entitySchema = userSchema;

  id!: number;
  email!: string;
  username!: string;
  avatarUrl!: string;
  auth!: Auth;
  creationTime!: Date;
  updateTime!: Date;
}
