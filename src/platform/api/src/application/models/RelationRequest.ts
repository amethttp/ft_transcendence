import { RelationType } from "./RelationType";

export default interface RelationRequest {
  username: string;
  relation: RelationType;
}