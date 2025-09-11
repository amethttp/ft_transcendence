import { Database, Statement } from "sqlite3";
import { DatabaseManager } from "../../database/databaseManager";
import { DatabaseMapper } from "../../database/databaseMapper";
import { IBaseRepository } from "../../../domain/repositories/IBaseRepository";
import { DatabaseRowResult } from "../models/DatabaseRowResult";

export class SQLiteBaseRepository<T> implements IBaseRepository<T> {
  private _db!: Database;
  private _tableName: string;
  private mapper: DatabaseMapper;

  constructor(tableName: string, entitySchema: Record<string, string>) {
    this._db = DatabaseManager.getInstance("/home/db/amethpong.db");
    this._tableName = tableName;
    this.mapper = new DatabaseMapper(entitySchema);
  }

  // --------------------------------- DB helpers --------------------------------- //

  public async dbBegin() {
    this._db.exec("BEGIN");
  }

  public async dbRollback() {
    this._db.exec("ROLLBACK");
  }

  public async dbCommit() {
    this._db.exec("COMMIT");
  }

  public async dbGet(query: string, params: any[]): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      this._db.get(query, params, (err, row) => {
        return err ? reject(err) : resolve((row as T) ?? null);
      });
    });
  }

  public async dbGetTest(query: string, params: any[]): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      this._db.get(query, params, (err, row) => {
        return err ? reject(err) : resolve(JSON.parse((row as DatabaseRowResult).result) ?? null);
      });
    });
  }

  private async dbAll(query: string, params: any): Promise<T[] | null> {
    return new Promise<T[] | null>((resolve, reject) => {
      this._db.all(query, params, (err, rows) => {
        return err ? reject(err) : resolve((rows as T[]) ?? null);
      });
    });
  }

  private async dbStmtRunCreate(stmt: Statement, params: any): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      stmt.run(params, function (err) {
        return err ? reject(err) : resolve(this.lastID ?? null);
      });
    });
  }

  private async dbStmtRunAlter(stmt: Statement, params: any): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      stmt.run(params, function (err) {
        return err ? reject(err) : resolve(this.changes ?? null);
      });
    });
  }

  // TODO: Delete the linter ignore below!
  // @ts-ignore
  private async findLastInstanceOf(): Promise<T | null> {
    const sql = `SELECT id FROM ${this._tableName} ORDER BY id DESC LIMIT 1`;
    return this.dbGet(sql, []);
  }

  // --------------------------------- CRUD --------------------------------- //

  public async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE id=?`;
    return this.dbGet(sql, [id]);
  }

  public async findByCondition(toSearch: string, arg: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE ${toSearch}=?`;
    return this.dbGet(sql, [arg]);
  }

  public async findAll(): Promise<T[] | null> {
    const sql = `SELECT * FROM ${this._tableName}`;
    return this.dbAll(sql, []);
  }

  public async create(data: Partial<T>): Promise<number | null> {
    const dbRecord = this.mapper.toDatabase(Object.entries(data));
    const keys = Object.keys(dbRecord);
    const values = Object.values(dbRecord);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this._tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const stmt = this._db.prepare(sql);
    const lastID = await this.dbStmtRunCreate(stmt, values);
    stmt.finalize(); // TODO: check this...

    if (lastID)
      return lastID;

    return null;
  }

  public async update(id: number, data: Partial<T>): Promise<number | null> {
    const dbRecord = this.mapper.toDatabase(Object.entries(data));
    dbRecord['update_time'] = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const filteredRecord = Object.entries(dbRecord)
      .filter(([key, value]) => value !== undefined && value !== null && key !== 'id')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    const keys = Object.keys(filteredRecord);
    const values = Object.values(filteredRecord);
    if (keys.length === 0) {
      return null;
    }
    const placeholders = keys.map(key => `${key}=?`).join(', ');

    const sql = `UPDATE ${this._tableName} SET ${placeholders} WHERE id=?`;
    const stmt = this._db.prepare(sql);
    await this.dbStmtRunAlter(stmt, [...values, id]);
    stmt.finalize();

    return id;
  }

  public async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM ${this._tableName} WHERE id=?`;
    const stmt = this._db.prepare(sql);
    const affectedNumber = await this.dbStmtRunAlter(stmt, [id]);
    stmt.finalize();

    return affectedNumber ? affectedNumber > 0 : false;
  }
}
