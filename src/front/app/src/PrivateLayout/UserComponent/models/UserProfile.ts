import type { TUserStatus } from "../../models/UserStatus";
import type { Relation } from "./Relation";

export default interface UserProfile {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: Relation;
  status: TUserStatus;
}