import { AEntity } from "./AEntity";
import { User } from "./User";

const downloadDataSchema: Record<string, string> = {
  id: "id",
  user: "user_id",
  token: "token",
  creationTime: "creation_time"
};

export class DownloadData extends AEntity {
  static readonly tableName = "download_data";
  static readonly entitySchema = downloadDataSchema;

  id!: number;
  user!: User;
  token!: string;
  creationTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.user = new User();
    this.token = "";
    this.creationTime = "";
  }

  public get tableName(): string {
    return DownloadData.tableName;
  }

  public get schema(): Record<string, string> {
    return DownloadData.entitySchema;
  }
}
