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
  googleUserId!: string;
  creationTime!: string;
  updateTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.googleUserId = "";
    this.creationTime = "";
    this.updateTime = "";
  }

  public get tableName(): string {
    return GoogleAuth.tableName;
  }

  public get schema(): Record<string, string> {
    return GoogleAuth.entitySchema;
  }
}
