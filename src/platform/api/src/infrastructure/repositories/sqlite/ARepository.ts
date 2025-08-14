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

  private async dbStmtRun(stmt: Statement, params: any): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      stmt.run(params, function (err) {
        return err ? reject(err) : resolve(this.lastID ?? null);
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
    const dbRecord: { [key: string]: any } = this.mapper.toDatabase(Object.entries(data));
    const keys: string[] = Object.keys(dbRecord);
    const values: any[] = Object.values(dbRecord);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this._tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const stmt = this._db.prepare(sql);
    const lastID = await this.dbStmtRun(stmt, values);
    stmt.finalize();

    if (lastID)
      return await this.findById(lastID);

    return null;
  }

  // async update(id: number, data: Partial<T>): Promise<T> { }
  // async delete(id: number): Promise<boolean> { }

  // --------------------------------- Generic Find method --------------------------------- //

  protected async findByCondition(toSearch: string, arg: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE ${toSearch}=?`;
    return this.dbGet(sql, [arg]);
  }
}
