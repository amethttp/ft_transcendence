export const UserStatus = {
  ONLINE: 1,
  OFFLINE: 2,
} as const;

export type TUserStatus = typeof UserStatus[keyof typeof UserStatus];