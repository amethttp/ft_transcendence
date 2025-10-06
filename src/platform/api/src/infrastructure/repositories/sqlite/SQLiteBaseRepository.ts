import { Database, Statement } from "sqlite3";
import { DatabaseManager } from "../../database/databaseManager";
import { DatabaseMapper } from "../../database/databaseMapper";
import { IBaseRepository } from "../../../domain/repositories/IBaseRepository";
import { DatabaseRowResult } from "../models/DatabaseRowResult";
import { AEntity } from "../../../domain/entities/AEntity";
import { ErrorParams, ResponseError } from "../../../application/errors/ResponseError";
import StringTime from "../../../application/helpers/StringTime";

export class SQLiteBaseRepository<T extends AEntity> implements IBaseRepository<T> {
  private _db!: Database;
  protected _entity: AEntity;

  constructor(entity: AEntity) {
    this._db = DatabaseManager.getInstance("/home/db/amethpong.db");
    this._entity = entity;
  }

  // --------------------------------- DB base functions --------------------------------- //

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
        if (err) {
          return reject(err);
        }
        if (row) { 
          try {
            const result = JSON.parse((row as DatabaseRowResult).result); // TODO: refactor this
            return resolve(result as T);
          } catch (error) {
            console.log(error);
            return reject(new ResponseError(ErrorParams.DATABASE_ERROR));
          }
        } else {
          return resolve(null);
        } 
      });
    });
  }

  public async dbRawGet(query: string, params: any[]): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      this._db.get(query, params, (err, row) => {
        if (err) {
          return reject(err);
        }
        if (row) { 
          try {
            const result = row;
            return resolve(result as T);
          } catch (error) {
            console.log(error);
            return reject(new ResponseError(ErrorParams.DATABASE_ERROR));
          }
        } else {
          return resolve(null);
        } 
      });
    });
  }

  public async dbAll(query: string, params: any): Promise<T[] | null> {
    return new Promise<T[] | null>((resolve, reject) => {
      this._db.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        if (rows) { 
          try {
            let result: T[] = [];
            for (const row of rows) {
              result.push(JSON.parse((row as DatabaseRowResult).result) as T); // TODO: refactor this
            }
            return resolve(result);
          } catch (error) {
            return reject(new ResponseError(ErrorParams.DATABASE_ERROR));
          }
        } else {
          return resolve(null);
        }
      });
    });
  }

  public async dbStmtRunCreate(stmt: Statement, params: any): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      stmt.run(params, function (err) {
        return err ? reject(err) : resolve(this.lastID ?? null);
      });
    });
  }

  public async dbStmtRunAlter(stmt: Statement, params: any): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      stmt.run(params, function (err) {
        return err ? reject(err) : resolve(this.changes ?? null);
      });
    });
  }

  // --------------------------------- CRUD --------------------------------- //

  public async baseFind(query: string, args: any[]): Promise<T | null> {
    const sql = DatabaseMapper.mapEntityToQuery(this._entity) + query;
    return this.dbGet(sql, args);
  }

  public async baseFindAll(query: string, args: any[]): Promise<T[] | null> {
    const sql = DatabaseMapper.mapEntityToQuery(this._entity) + query;
    return this.dbAll(sql, args);
  }

  public async findById(id: number): Promise<T | null> {
    const sql = DatabaseMapper.mapEntityToQuery(this._entity) + `WHERE ${this._entity.tableName}.id=?`;
    return this.dbGet(sql, [id]);
  }

  public async findByCondition(toSearch: string, arg: string): Promise<T | null> {
    const sql = DatabaseMapper.mapEntityToQuery(this._entity) + `WHERE ${toSearch}=?`;
    return this.dbGet(sql, [arg]);
  }

  public async findAll(): Promise<T[] | null> {
    const sql = DatabaseMapper.mapEntityToQuery(this._entity);
    return this.dbAll(sql, []);
  }

  public async create(data: Partial<T>): Promise<number | null> {
    const dbRecord = DatabaseMapper.toDatabase(Object.entries(data), this._entity.schema);
    const keys = Object.keys(dbRecord);
    const values = Object.values(dbRecord);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this._entity.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const stmt = this._db.prepare(sql);
    const lastID = await this.dbStmtRunCreate(stmt, values);
    stmt.finalize(); // TODO: check this...

    if (lastID)
      return lastID;

    return null;
  }

  public async update(id: number, data: Partial<T>): Promise<number | null> {
    const dbRecord = DatabaseMapper.toDatabase(Object.entries(data), this._entity.schema);
    if ('updateTime' in this._entity.schema) { // TODO: can use ON UPDATE in database
      dbRecord[this._entity.schema['updateTime']] = StringTime.now();
    }
    const filteredRecord = Object.entries(dbRecord)
      .filter(([key, value]) => value !== undefined && value !== null && key !== 'id')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    const keys = Object.keys(filteredRecord);
    const values = Object.values(filteredRecord);
    if (keys.length === 0) {
      return null;
    }
    const placeholders = keys.map(key => `${key}=?`).join(', ');

    const sql = `UPDATE ${this._entity.tableName} SET ${placeholders} WHERE id=?`;
    const stmt = this._db.prepare(sql);
    const changes = await this.dbStmtRunAlter(stmt, [...values, id]);
    stmt.finalize();

    if (changes === null)
        return null;

    return id;
  }

  public async baseDelete(query: string, args: any[]): Promise<boolean> {
    const sql = `DELETE FROM ${this._entity.tableName}` + " " + query;
    const stmt = this._db.prepare(sql);
    const affectedNumber = await this.dbStmtRunAlter(stmt, args);
    stmt.finalize();

    return affectedNumber ? affectedNumber > 0 : false;
  }

  public async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM ${this._entity.tableName} WHERE id=?`;
    const stmt = this._db.prepare(sql);
    const affectedNumber = await this.dbStmtRunAlter(stmt, [id]);
    stmt.finalize();

    return affectedNumber ? affectedNumber > 0 : false;
  }
}
