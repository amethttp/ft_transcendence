export const RelationType = {
  FRIENDSHIP_REQUESTED: 1,
  FRIENDSHIP_ACCEPTED: 2,
  BLOCKED: 3,
  NO_RELATION: 4,
} as const;

export type TRelationType = typeof RelationType[keyof typeof RelationType];

export type Relation = {
  type: TRelationType;
  owner: boolean;
};