import { UserMatchDownloadDto } from "./UserMatchDownloadDto";
import { UserRelationDownloadDto } from "./UserRelationDownloadDto";
import { UserStatsResponse } from "./UserStatsResponse";
import { UserStatusDownloadDto } from "./UserStatusDownloadDto";
import { UserTournamentDownloadDto } from "./UserTournamentDownloadDto";

export interface UserDataExportDto {
  exportedAt: string;
  profile: {
    id: number;
    email: string;
    username: string;
    avatarUrl: string;
    birthDate: string;
    creationTime: string;
    updateTime: string;
  };
  authentication: {
    authId: number;
    lastLogin: string;
    hasPassword: boolean;
    passwordUpdatedAt?: string;
    hasGoogleAuth: boolean;
  };
  userStatus: UserStatusDownloadDto;
  userStats: UserStatsResponse;
  socialRelations: UserRelationDownloadDto[];
  matchHistory: UserMatchDownloadDto[];
  tournamentHistory: UserTournamentDownloadDto[];
}