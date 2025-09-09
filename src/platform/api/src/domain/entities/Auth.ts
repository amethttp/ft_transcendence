import { AEntity } from "./AEntity";
import { GoogleAuth } from "./GoogleAuth";
import { Password } from "./Password";

const authSchema: Record<string, string> = {
  lastLogin: "last_login",
  googleAuth: "google_auth_id",
  password: "password_id",
};

export class Auth extends AEntity {
  static readonly tableName = "auth";
  static readonly entitySchema = authSchema;

  id!: number;
  lastLogin!: Date;
  googleAuth?: GoogleAuth;
  password?: Password;
}
