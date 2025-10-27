import type { TUserStatus } from "../../models/UserStatus";
import type { Relation } from "./Relation";

export default interface UserProfile {
  id: number;
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: Relation;
  status: TUserStatus;
}