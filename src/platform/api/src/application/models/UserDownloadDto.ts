type PasswordDownloadDto = {
  id: number,
  updateTime: string
}

type GoogleAuthDownloadDto = {
  id: number,
  googleUserId: string
}

type AuthDownloadDto = {
  id: number,
  lastLogin: string,
  googleAuth?: GoogleAuthDownloadDto
  password?: PasswordDownloadDto,
}

export type UserDownloadDto = {
  id: number
  email: string,
  username: string,
  birthDate: string,
  avatarUrl: string,
  creationTime: string,
  updateTime: string,
  auth: AuthDownloadDto
}
