export type UserRelationType = 'FRIENDSHIP_REQUESTED' | 'FRIENDSHIP_ACCEPTED' | 'BLOCKED';

export type UserRelationDownloadDto = {
  alias?: string,
  type: UserRelationType,
  ownerUserId: number,
  ownerUsername: string,
  receiverUserId: number,
  receiverUsername: string,
  creationTime: string,
  updateTime: string
}
