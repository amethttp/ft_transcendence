import { Database } from 'sqlite3';

export abstract class BaseRepository<T> {
  protected tableName: string;
  constructor(protected db: Database, tableName: string) {
    this.tableName = tableName;
  }

  async find(toSearch: string, arg: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${toSearch}${arg}`;
    const row = this.db.get(sql);
    return row ? (row as T) : null;
  }

  async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id=?`;
    // const res = this.db.run("SELECT * FROM ? WHERE id=?", [this.tableName, id]);
    const row = this.db.get(sql, [id]);
    return row ? (row as T) : null;
  }

  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.tableName}`;
    return new Promise<T[]>((resolve, reject) => { // need to promisify!!! // import promisify...
      this.db.all(sql, (err, rows) => {
        return err ? reject(err) : resolve(rows as T[]);
      });
    });
  }

  async create(data: Partial<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
    });
  }
  // async update(id: number, data: Partial<T>): Promise<T> { }
  // async delete(id: number): Promise<boolean> { }
}