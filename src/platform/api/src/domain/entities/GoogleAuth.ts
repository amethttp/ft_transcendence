import { AEntity } from "./AEntity";

const googleAuthSchema: Record<string, string> = {
  id: "id",
  googleUserId: "google_user_id",
  accessToken: "access_token",
  refreshToken: "refresh_token",
  tokenType: "token_type",
  expirationTime: "expiration_time",
  scope: "scope",
  creationTime: "creation_time",
  updateTime: "update_time",
};

export class GoogleAuth extends AEntity {
  static readonly tableName = "google_auth";
  static readonly entitySchema = googleAuthSchema;

  id!: number;
  googleUserid!: number;
  accessToken!: string;
  refreshToken!: string;
  tokenType!: string;
  expirationTime!: string;
  scope!: string;
  creationTime!: string;
  updateTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.googleUserid = -1;
    this.accessToken = "";
    this.refreshToken = "";
    this.tokenType = "";
    this.expirationTime = new Date();
    this.scope = "";
    this.creationTime = new Date();
    this.updateTime = new Date();
  }

  public get tableName(): string {
    return GoogleAuth.tableName;
  }

  public get schema(): Record<string, string> {
    return GoogleAuth.entitySchema;
  }
}