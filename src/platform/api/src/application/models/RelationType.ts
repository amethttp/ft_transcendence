export const Relation = {
  FRIENDSHIP_REQUESTED: 0,
  FRIENDSHIP_ACCEPTED: 1,
  BLOCKED: 2,
  NO_RELATION: 3,
} as const;

export type RelationType = typeof Relation[keyof typeof Relation];