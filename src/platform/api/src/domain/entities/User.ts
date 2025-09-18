import { AEntity } from "./AEntity";
import { Auth } from "./Auth";

const userSchema: Record<string, string> = {
  id: "id",
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
  creationTime!: string;
  updateTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.email = "";
    this.username = "";
    this.avatarUrl = "";
    this.auth = new Auth();
    this.creationTime = "";
    this.updateTime = "";
  }

  public get tableName(): string {
    return User.tableName;
  }

  public get schema(): Record<string, string> {
    return User.entitySchema;
  }
}
