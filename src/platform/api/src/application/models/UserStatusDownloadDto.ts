type UserConnectionStatus = 'ONLINE' | 'OFFLINE';

export type UserStatusDownloadDto = {
  status: UserConnectionStatus,
  creationTime: string,
  updateTime: string
}
