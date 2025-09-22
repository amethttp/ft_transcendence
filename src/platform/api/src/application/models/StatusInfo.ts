export const Status = {
  ONLINE: 1,
  OFFLINE: 2,
} as const;

export type StatusType = typeof Status[keyof typeof Status];

export type StatusInfo = {
  userId: number,
  value: StatusType,
}
