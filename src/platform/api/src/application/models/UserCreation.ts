export interface UserCreationDto {
  username: string;
  email: string;
  password?: string;
  birthDate: string;
  avatarUrl?: string;
}
