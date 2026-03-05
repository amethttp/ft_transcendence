export const MatchMode = {
  ONLINE: 1,
  LOCAL: 2,
  AI: 3,
} as const;

export type TMatchMode = typeof MatchMode[keyof typeof MatchMode];
