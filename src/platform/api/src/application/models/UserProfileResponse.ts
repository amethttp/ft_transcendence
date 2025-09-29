import { Relation } from "./Relation";
import { TStatusType } from "./UserStatusDto";

export interface UserProfile {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: Relation;
  status: TStatusType;
}
