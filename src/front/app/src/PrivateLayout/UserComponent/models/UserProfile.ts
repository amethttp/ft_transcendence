import type { RelationInfo } from "./RelationInfo";

export default interface UserProfile {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: RelationInfo;
  online: boolean;
}