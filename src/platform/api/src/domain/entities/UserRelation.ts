import { AEntity } from "./AEntity";
import { User } from "./User";

const userRelationSchema: Record<string, string> = {
  id: "id",
  alias: "alias",
  type: "type",
  ownerUser: "owner_user_id",
  receiverUser: "receiver_user_id",
  creationTime: "creation_time",
  updateTime: "update_time",
};

export class UserRelation extends AEntity {
  static readonly tableName = "user_relation";
  static readonly entitySchema = userRelationSchema;

  id!: number;
  alias?: string;
  type!: number;
  ownerUser!: User;
  receiverUser!: User;
  creationTime!: Date;
  updateTime!: Date;

  constructor() {
    super();
    this.id = -1;
    this.alias = "";
    this.type = 0;
    this.ownerUser = new User();
    this.receiverUser = new User();
    this.creationTime = new Date();
    this.updateTime = new Date();
  }

  public get tableName(): string {
    return UserRelation.tableName;
  }

  public get schema(): Record<string, string> {
    return UserRelation.entitySchema;
  }
}
