import { AEntity } from "./AEntity";
import { User } from "./User";

const recoverPasswordSchema: Record<string, string> = {
  user: "user_id",
  token: "token",
  creationTime: "creation_time"
};

export class RecoverPassword extends AEntity {
  static readonly tableName = "recover_password";
  static readonly entitySchema = recoverPasswordSchema;

  id!: number;
  user!: User;
  token!: string;
  creationTime!: Date;
}
