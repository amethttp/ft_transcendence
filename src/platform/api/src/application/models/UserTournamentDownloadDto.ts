export type UserTournamentState = 'WAITING' | 'CLOSED' | 'IN_PROGRESS' | 'FINISHED'

export type UserTournamentDownloadDto = {
  id: number,
  name: string,
  currentRound: number,
  isVisible: string,
  playersAmount: number,
  state: UserTournamentState
  points: number,
  userRound: number,
  creationTime: string,
  finishTime?: string
}
