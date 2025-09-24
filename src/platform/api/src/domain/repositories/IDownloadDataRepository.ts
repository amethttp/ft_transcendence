import { DownloadData } from "../entities/DownloadData";
import { IBaseRepository } from "./IBaseRepository";

export interface IDownloadDataRepository extends IBaseRepository<DownloadData> {
  findByToken(token: string): Promise<DownloadData | null>;
  findAllByUser(id: number): Promise<DownloadData[] | null>;
  deleteAllByUser(id: number): Promise<boolean | null>;
}

