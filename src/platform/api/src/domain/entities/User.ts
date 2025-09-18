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
  static readonly entitySchema = userSchema; // TODO: maybe change to private so as not to return the actual static in getter

  id!: number;
  email!: string;
  username!: string;
  avatarUrl!: string;
  auth!: Auth;
  creationTime!: Date;
  updateTime!: Date;

  constructor() { // TODO: Option using reflect-metadata... 
    super();
    this.id = -1;
    this.email = "";
    this.username = "";
    this.avatarUrl = "";
    this.auth = new Auth();
    this.creationTime = new Date();
    this.updateTime = new Date();
  }

  public get tableName(): string {
    return User.tableName;
  }

  public get schema(): Record<string, string> {
    return User.entitySchema;
  }
}
