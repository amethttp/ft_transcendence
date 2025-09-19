export const Relation = {
  FRIENDSHIP_REQUESTED: 1,
  FRIENDSHIP_ACCEPTED: 2,
  BLOCKED: 3,
  NO_RELATION: 4,
} as const;

export type RelationType = typeof Relation[keyof typeof Relation];

export type RelationInfo = {
  type: RelationType;
  owner: boolean;
};