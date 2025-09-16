import { RelationType } from "./RelationType";

export interface UserProfileResponse {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: RelationType;
  online: boolean;
}
