import { AEntity } from "./AEntity";
import { Auth } from "./Auth";

const userSchema: { [key: string]: string } = {
  email: "email",
  username: "username",
  avatarUrl: "avatar_url",
  creationTime: "creation_time",
  updateTime: "update_time",
  auth: "auth_id",
};

export class User extends AEntity {
  static readonly tableName = "user";
  static readonly entitySchema = userSchema;

  id!: number;
  email!: string;
  username!: string;
  avatarUrl!: string;
  creationTime!: Date;
  updateTime!: Date;
  auth!: Auth;
}
