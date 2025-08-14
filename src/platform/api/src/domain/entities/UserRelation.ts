import { AEntity } from "./AEntity";
import { User } from "./User";

const userRelationSchema: { [key: string]: string } = {
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
}
