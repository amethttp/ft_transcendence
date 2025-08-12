import { Entity } from "./Entity";

export class User extends Entity {
  static readonly tableName = "user";
  id!: number;
  email!: string;
  username?: string;
  displayName!: string;
  avatarUrl!: string;
  creationTime!: Date;
  updateTime!: Date;
  authId!: number; // TODO: Add auth entity
}
