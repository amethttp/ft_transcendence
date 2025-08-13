import { Database } from "sqlite3";

export abstract class ARepository<T> {
  protected _db!: Database;
  protected _tableName: string;

  constructor(tableName: string) {
    this._db = new Database("/home/db/amethpong.db");
    this._tableName = tableName;
  }

  // --------------------------------- DB Promisify helpers --------------------------------- //

  private async dbGet(query: string, params: any[]) {
    return new Promise<T | null>((resolve, reject) => {
      this._db.get(query, params, (err, row) => {
        return err ? reject(err) : resolve(row ? (row as T) : null);
      });
    });
  }

  private async dbAll(query: string) {
    return new Promise<T[] | null>((resolve, reject) => {
      this._db.all(query, (err, rows) => {
        return err ? reject(err) : resolve(rows ? (rows as T[]) : null);
      });
    });
  }

  // --------------------------------- CRUD --------------------------------- //

  async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE id=?`;
    return this.dbGet(sql, [id]);
  }

  async findAll(): Promise<T[] | null> {
    const sql = `SELECT * FROM ${this._tableName}`;
    return this.dbAll(sql);
  }

  private async findLastInstanceOf(): Promise<T | null> {
    const sql = `SELECT id FROM ${this._tableName} ORDER BY id DESC LIMIT 1`;
    return this.dbGet(sql, []);
  }

  async create(data: Partial<T>): Promise<T | null> {
    let keys: string[] = [];
    let values: any[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && 'id' in value) {
        keys.push(key + '_id');
        values.push((value as any).id);
      } else {
        keys.push(key);
        values.push(value);
      }
    }

    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this._tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
  
    const stmt = this._db.prepare(sql, values);
    stmt.run(values);
    stmt.finalize();

    const result = await this.findLastInstanceOf();
    return result;
  }

  // async update(id: number, data: Partial<T>): Promise<T> { }
  // async delete(id: number): Promise<boolean> { }

  // --------------------------------- Generic Find method --------------------------------- //

  protected async findByCondition(toSearch: string, arg: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE ${toSearch}=?`;
    const row = this._db.get(sql, [arg]);
    return row ? (row as T) : null;
  }
}
