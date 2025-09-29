import { RelationInfo } from "./RelationInfo";

export interface UserProfileResponse {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: RelationInfo;
  online: number;
}
