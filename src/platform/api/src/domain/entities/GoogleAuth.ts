import { AEntity } from "./AEntity";

const googleAuthSchema: Record<string, string> = {
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
  expirationTime!: Date;
  scope!: string;
  creationTime!: Date;
  updateTime!: Date;
}