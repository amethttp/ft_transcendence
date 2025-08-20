import { AEntity } from "./AEntity";

const passwordSchema: Record<string, string> = {
  hash: "hash",
  updateTime: "update_time",
};

export class Password extends AEntity {
  static readonly tableName = "password";
  static readonly entitySchema = passwordSchema;

  id!: number;
  hash!: string;
  updateTime!: Date;
}