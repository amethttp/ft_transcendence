export const MatchState = {
  WAITING: "WAITING",
  READY: "READY",
  IN_PROGRESS: "IN_PROGRESS",
  PAUSED: "PAUSED",
  FINISHED: "FINISHED",
} as const;

export type TMatchState = typeof MatchState[keyof typeof MatchState];
