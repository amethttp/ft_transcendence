import { DownloadData } from "../../domain/entities/DownloadData";
import { MatchState } from "../../domain/entities/Match";
import { MatchPlayer } from "../../domain/entities/MatchPlayer";
import { TournamentState } from "../../domain/entities/Tournament";
import { TournamentPlayer } from "../../domain/entities/TournamentPlayer";
import { User } from "../../domain/entities/User";
import { UserRelation } from "../../domain/entities/UserRelation";
import { UserStatus } from "../../domain/entities/UserStatus";
import { IDownloadDataRepository } from "../../domain/repositories/IDownloadDataRepository";
import { IMatchPlayerRepository } from "../../domain/repositories/IMatchPlayerRepository";
import { ITournamentPlayerRepository } from "../../domain/repositories/ITournamentPlayerRepository";
import { IUserRelationRepository } from "../../domain/repositories/IUserRelationRepository";
import { IUserStatusRepository } from "../../domain/repositories/IUserStatusRepository";
import { ErrorParams, ResponseError } from "../errors/ResponseError";
import { RelationType } from "../models/Relation";
import { UserDownloadDto } from "../models/UserDownloadDto";
import { UserMatchDownloadDto, UserMatchState } from "../models/UserMatchDownloadDto";
import { UserRelationDownloadDto, UserRelationType } from "../models/UserRelationDownloadDto";
import { UserStatusDownloadDto } from "../models/UserStatusDownloadDto";
import { StatusType } from "../models/UserStatusDto";
import { UserTournamentDownloadDto, UserTournamentState } from "../models/UserTournamentDownloadDto";

export class DownloadDataService {
  private _downloadDataRepository: IDownloadDataRepository;
  private _userStatusRespository: IUserStatusRepository;
  private _userRelationRepository: IUserRelationRepository;
  private _matchPlayerRepository: IMatchPlayerRepository;
  private _tournamentPlayerRepository: ITournamentPlayerRepository;

  constructor(
    downloadDataRepository: IDownloadDataRepository,
    userStatusRepository: IUserStatusRepository,
    userRelationRepository: IUserRelationRepository,
    matchPlayerRepository: IMatchPlayerRepository,
    tournamentPlayerRepository: ITournamentPlayerRepository
  ) {
    this._downloadDataRepository = downloadDataRepository;
    this._userStatusRespository = userStatusRepository;
    this._userRelationRepository = userRelationRepository;
    this._matchPlayerRepository = matchPlayerRepository;
    this._tournamentPlayerRepository = tournamentPlayerRepository;
  }

  private static toUserDownloadDto(user: User): UserDownloadDto {
    const dto: UserDownloadDto = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      birthDate: user.birthDate,
      creationTime: user.creationTime,
      updateTime: user.updateTime,
      auth: {
        id: user.auth.id,
        lastLogin: user.auth.lastLogin,
        password: user.auth.password ? {
          id: user.auth.password.id,
          updateTime: user.auth.password.updateTime
        } : undefined,
        googleAuth: user.auth.googleAuth ? {
          id: user.auth.googleAuth.id,
          googleUserId: user.auth.googleAuth.googleUserId
        } : undefined,
      }
    };

    if (!dto.auth.password) delete dto.auth.password;
    if (!dto.auth.googleAuth) delete dto.auth.googleAuth;

    return dto;
  }

  private static toUserStatusDownloadDto(userStatus: UserStatus): UserStatusDownloadDto {
    const dto: UserStatusDownloadDto = {
      status: userStatus.type == StatusType.ONLINE ? 'ONLINE' : 'OFFLINE',
      creationTime: userStatus.creationTime,
      updateTime: userStatus.updateTime
    };

    return dto;
  }

  private static toUserRelationsDownloadDto(userRelations: UserRelation[]): UserRelationDownloadDto[] {
    const dto: UserRelationDownloadDto[] = [];

    for (let userRelation of userRelations) {
      let relationType: UserRelationType = 'FRIENDSHIP_REQUESTED';

      if (userRelation.type == RelationType.FRIENDSHIP_ACCEPTED)
        relationType = 'FRIENDSHIP_ACCEPTED';
      else if (userRelation.type == RelationType.BLOCKED)
        relationType = 'BLOCKED';

      const userRelationDto: UserRelationDownloadDto = {
        alias: userRelation.alias,
        type: relationType,
        ownerUserId: userRelation.ownerUser.id,
        ownerUsername: userRelation.ownerUser.username,
        receiverUserId: userRelation.receiverUser.id,
        receiverUsername: userRelation.receiverUser.username,
        creationTime: userRelation.creationTime,
        updateTime: userRelation.updateTime
      }

      dto.push(userRelationDto);
    }

    return dto;
  }

  private static toUserMatchesDownloadDto(matchPlayers: MatchPlayer[]): UserMatchDownloadDto[] {
    const dto: UserMatchDownloadDto[] = [];

    for (let player of matchPlayers) {
      let matchState: UserMatchState = 'WAITING';

      if (player.match.state == MatchState.IN_PROGRESS)
        matchState = 'IN_PROGRESS';
      else if (player.match.state == MatchState.FINISHED)
        matchState = 'FINISHED';

      const matchDto: UserMatchDownloadDto = {
        id: player.match.id,
        name: player.match.name,
        points: player.match.points,
        isVisible: player.match.isVisible ? "true" : "false",
        tournamentRoundId: player.match.tournamentRound?.id,
        state: matchState,
        userScore: player.score,
        isWinner: player.isWinner ? "true" : "false",
        creationTime: player.match.creationTime,
        finishTime: player.match.finishTime
      }

      dto.push(matchDto);
    }

    return dto;
  }

  private static toUserTournamentsDownloadDto(tournamentPlayers: TournamentPlayer[]): UserTournamentDownloadDto[] {
    const dto: UserTournamentDownloadDto[] = [];

    for (let player of tournamentPlayers) {
      let tournamentState: UserTournamentState = 'WAITING';

      if (player.tournament.state == TournamentState.CLOSED)
        tournamentState = 'CLOSED';
      else if (player.tournament.state == TournamentState.IN_PROGRESS)
        tournamentState = 'IN_PROGRESS';
      else if (player.tournament.state == TournamentState.FINISHED)
        tournamentState = 'FINISHED';

      const tournamentDto: UserTournamentDownloadDto = {
        id: player.tournament.id,
        name: player.tournament.name,
        currentRound: player.tournament.round,
        isVisible: player.tournament.isVisible ? "true" : "false",
        playersAmount: player.tournament.playersAmount,
        state: tournamentState,
        points: player.tournament.points,
        userRound: player.round,
        creationTime: player.tournament.creationTime,
        finishTime: player.tournament.finishTime
      }

      dto.push(tournamentDto);
    }

    return dto;
  }

  async newDownloadData(inputUser: User, inputToken: string): Promise<DownloadData | null> {
    const downloadDataBlueprint: Partial<DownloadData> = {
      user: inputUser,
      token: inputToken
    };

    const id = await this._downloadDataRepository.create(downloadDataBlueprint);
    if (id === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }
    const downloadData = await this._downloadDataRepository.findById(id);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.REGISTRATION_FAILED);
    }

    return downloadData;
  }

  async getByToken(token: string): Promise<DownloadData> {
    const downloadData = await this._downloadDataRepository.findByToken(token);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return downloadData;
  }

  async getUserDownloadDataByToken(token: string): Promise<UserDownloadDto> {
    const downloadData = await this._downloadDataRepository.findByToken(token);
    if (downloadData === null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return DownloadDataService.toUserDownloadDto(downloadData.user);
  }

  async getUserStatusDownloadDataByUserId(userId: number) {
    const userStatus = await this._userStatusRespository.findByUserId(userId);

    if (userStatus == null) {
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);
    }

    return DownloadDataService.toUserStatusDownloadDto(userStatus);
  }

  async getUserRelationDownloadDataByUserId(userId: number) {
    const userRelations = await this._userRelationRepository.findAllBySingleUser(userId);

    if (userRelations == null)
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);

    return DownloadDataService.toUserRelationsDownloadDto(userRelations);
  }

  async getUserMatchesDownloadDataByUserId(userId: number) {
    const userMatchPlayers = await this._matchPlayerRepository.findAllByUser(userId);

    if (userMatchPlayers == null)
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);

    return DownloadDataService.toUserMatchesDownloadDto(userMatchPlayers);
  }

  async getUserTournamentsDownloadDataByUserId(userId: number) {
    const userTournamentPlayers = await this._tournamentPlayerRepository.findAllByUser(userId);

    if (userTournamentPlayers == null)
      throw new ResponseError(ErrorParams.DOWNLOAD_DATA_FAILED);

    return DownloadDataService.toUserTournamentsDownloadDto(userTournamentPlayers);
  }

  async deleteByToken(token: string) {
    const data: DownloadData = await this.getByToken(token);
    await this._downloadDataRepository.delete(data.id);
  }

  async eraseAllUserDownloadDatas(user: User) {
    await this._downloadDataRepository.deleteAllByUser(user.id);
  }

  async delete(downloadData: DownloadData) {
    if (!(await this._downloadDataRepository.delete(downloadData.id))) {
      throw new ResponseError(ErrorParams.UNKNOWN_SERVER_ERROR);
    }
  }
}
