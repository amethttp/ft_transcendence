import { AEntity } from "./AEntity";
import { User } from "./User";

const userVerificationSchema: Record<string, string> = {
  id: "id",
  user: "user_id",
  code: "code",
  creationTime: "creation_time"
};

export class UserVerification extends AEntity {
  static readonly tableName = "user_verification";
  static readonly entitySchema = userVerificationSchema;

  id!: number;
  user!: User;
  code!: number;
  creationTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.user = new User();
    this.code = 0;
    this.creationTime = "";
  }

  public get tableName(): string {
    return UserVerification.tableName;
  }

  public get schema(): Record<string, string> {
    return UserVerification.entitySchema;
  }
}