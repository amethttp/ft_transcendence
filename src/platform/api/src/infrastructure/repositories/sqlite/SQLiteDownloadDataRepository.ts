import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { IDownloadDataRepository } from "../../../domain/repositories/IDownloadDataRepository";
import { DownloadData } from "../../../domain/entities/DownloadData";

export class SQLiteDownloadDataRepository extends SQLiteBaseRepository<DownloadData> implements IDownloadDataRepository {

  constructor() {
    super(new DownloadData());
  }

  findByToken(token: string): Promise<DownloadData | null> {
    const expirationSeconds = 300;
    const query = `WHERE ${DownloadData.tableName}.token =? AND (strftime('%s','now') - strftime('%s', ${DownloadData.tableName}.creation_time)) <?`;
    return this.baseFind(query, [token, expirationSeconds]);
  };

  findAllByUser(id: number): Promise<DownloadData[] | null> {
    const query = `WHERE user_id =?`;
    return this.baseFindAll(query, [id]);
  }

  deleteAllByUser(id: number): Promise<boolean | null> {
    const query = `WHERE user_id=?`;
    return this.baseDelete(query, [id]);
  }
}
