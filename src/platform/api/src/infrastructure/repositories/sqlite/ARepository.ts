import { Database, Statement } from "sqlite3";
import { DatabaseManager } from "../../database/databaseManager";
import { DatabaseMapper } from "../../database/databaseMapper";

export abstract class ARepository<T> {
  protected _db!: Database;
  protected _tableName: string;
  protected mapper: DatabaseMapper;

  constructor(tableName: string, entitySchema: { [key: string]: string }) {
    this._db = DatabaseManager.getInstance("/home/db/amethpong.db");
    this._tableName = tableName;
    this.mapper = new DatabaseMapper(entitySchema);
  }

  // --------------------------------- DB helpers --------------------------------- //

  private async dbGet(query: string, params: any[]): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      this._db.get(query, params, (err, row) => {
        return err ? reject(err) : resolve((row as T) ?? null);
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

  private async findLastInstanceOf(): Promise<T | null> {
    const sql = `SELECT id FROM ${this._tableName} ORDER BY id DESC LIMIT 1`;
    return this.dbGet(sql, []);
  }

  // --------------------------------- CRUD --------------------------------- //

  async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE id=?`;
    return this.dbGet(sql, [id]);
  }

  async findAll(): Promise<T[] | null> {
    const sql = `SELECT * FROM ${this._tableName}`;
    return this.dbAll(sql, []);
  }

  async create(data: Partial<T>): Promise<T | null> {
    const dbRecord: { [key: string]: any } = this.mapper.toDatabase(Object.entries(data)); // TO DO: use reduce for mapper func
    const keys: string[] = Object.keys(dbRecord);
    const values: any[] = Object.values(dbRecord);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this._tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const stmt = this._db.prepare(sql);
    const lastID = await this.dbStmtRunCreate(stmt, values);
    stmt.finalize(); // TO DO: check this... + try catches...

    if (lastID)
      return await this.findById(lastID);

    return null;
  }

  // no need to check for existence you always want to update it to this time no matter input
  async update(id: number, data: Partial<T>): Promise<T | null> {
    const dbRecord: { [key: string]: any } = this.mapper.toDatabase(Object.entries(data));
    dbRecord['update_time'] = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const filteredRecord = Object.entries(dbRecord)
      .filter(([key, value]) => value !== undefined && value !== null && key !== 'id')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    const keys: string[] = Object.keys(filteredRecord);
    const values: any[] = Object.values(filteredRecord);
    if (keys.length === 0) {
      return await this.findById(id);
      }
    // TO DO: change naming??
    const placeholders = keys.map(key => `${key}=?`).join(', ');

    const sql = `UPDATE ${this._tableName} SET ${placeholders} WHERE id=?`;
    const stmt = this._db.prepare(sql);
    await this.dbStmtRunAlter(stmt, [...values, id]); // TO DO: lastID?? // ...values?
    stmt.finalize();

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM ${this._tableName} WHERE id=?`;
    const stmt = this._db.prepare(sql);
    let affectedId = await this.dbStmtRunAlter(stmt, [id]);
    stmt.finalize();

    return affectedId !>= 0;
  }

  // --------------------------------- Generic Find method --------------------------------- //

  protected async findByCondition(toSearch: string, arg: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE ${toSearch}=?`;
    return this.dbGet(sql, [arg]);
  }
}
