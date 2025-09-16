import type { RelationType } from "./RelationType";

export default interface UserProfile {
  username: string;
  avatarUrl: string;
  creationTime: string;
  relation: RelationType;
  online: boolean;
}