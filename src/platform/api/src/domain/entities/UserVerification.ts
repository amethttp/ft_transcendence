import { AEntity } from "./AEntity";
import { User } from "./User";

const userVerificationSchema: Record<string, string> = {
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
  creationTime!: Date;
}