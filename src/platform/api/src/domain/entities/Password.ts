import { AEntity } from "./AEntity";

const passwordSchema: Record<string, string> = {
  id: "id",
  hash: "hash",
  updateTime: "update_time",
};

export class Password extends AEntity {
  static readonly tableName = "password";
  static readonly entitySchema = passwordSchema;

  id!: number;
  hash?: string;
  updateTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.hash = "";
    this.updateTime = "";
  }

  public get tableName(): string {
    return Password.tableName;
  }

  public get schema(): Record<string, string> {
    return Password.entitySchema;
  }
}