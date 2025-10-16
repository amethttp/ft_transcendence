export const PlayerState = {
  WAITING: "WAITING",
  READY: "READY",
  IN_GAME: "IN_GAME",
} as const;

export type TPlayerState = typeof PlayerState[keyof typeof PlayerState];