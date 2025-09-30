export type JwtPayloadType = 'access' | 'refresh';

export interface JwtPayloadInfo {
  sub: number;
  type: JwtPayloadType;
}
