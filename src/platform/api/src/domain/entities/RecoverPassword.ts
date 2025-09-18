import { AEntity } from "./AEntity";
import { User } from "./User";

const recoverPasswordSchema: Record<string, string> = {
  id: "id",
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

  constructor() {
    super();
    this.id = -1;
    this.user = new User();
    this.token = "";
    this.creationTime = new Date();
  }

  public get tableName(): string {
    return RecoverPassword.tableName;
  }

  public get schema(): Record<string, string> {
    return RecoverPassword.entitySchema;
  }
}
