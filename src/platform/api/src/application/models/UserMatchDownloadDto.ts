export type UserMatchState = 'WAITING' | 'IN_PROGRESS' | 'FINISHED'

export type UserMatchDownloadDto = {
  id: number,
  name: string,
  points: number,
  isVisible: string,
  tournamentRoundId?: number,
  state: UserMatchState
  userScore: number,
  isWinner: string,
  creationTime: string,
  finishTime?: string
}
