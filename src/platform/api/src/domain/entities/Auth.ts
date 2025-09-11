import { AEntity } from "./AEntity";
import { GoogleAuth } from "./GoogleAuth";
import { Password } from "./Password";

const authSchema: Record<string, string> = {
  id: "id",
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

  constructor() {
    super();
    this.id = 0;
    this.lastLogin = new Date();
    this.password = new Password();
  }

  public get tableName() : string {
    return Auth.tableName;
  }

  public get schema() : Record<string, string> {
    return Auth.entitySchema;
  }
}
