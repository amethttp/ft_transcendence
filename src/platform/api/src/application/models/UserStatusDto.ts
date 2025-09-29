export const StatusType = {
  ONLINE: 1,
  OFFLINE: 2,
} as const;

export type TStatusType = typeof StatusType[keyof typeof StatusType];

export type UserStatusDto = {
  userId: number,
  value: TStatusType,
}
