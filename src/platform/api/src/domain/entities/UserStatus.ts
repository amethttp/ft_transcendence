import { AEntity } from "./AEntity";
import { User } from "./User";

const userStatusSchema: Record<string, string> = {
  id: "id",
  type: "type",
  user: "user_id",
  creationTime: "creation_time",
  updateTime: "update_time",
};

export class UserStatus extends AEntity {
  static readonly tableName = "user_status";
  static readonly entitySchema = userStatusSchema;

  id!: number;
  type!: number;
  user!: User;
  creationTime!: string;
  updateTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.type = 0;
    this.user = new User();
    this.creationTime = "";
    this.updateTime = "";
  }

  public get tableName(): string {
    return UserStatus.tableName;
  }

  public get schema(): Record<string, string> {
    return UserStatus.entitySchema;
  }
}
