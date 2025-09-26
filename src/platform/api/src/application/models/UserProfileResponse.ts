import { RelationInfo } from "./RelationInfo";
import { StatusType } from "./UserStatusDto";

export interface UserProfile {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: RelationInfo;
  status: StatusType;
}
