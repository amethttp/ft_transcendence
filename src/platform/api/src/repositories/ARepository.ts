import { Database } from "sqlite3";

export abstract class ARepository<T> {
  protected _db!: Database;
  protected _tableName: string;

  constructor(tableName: string) {
    this._db = new Database("/home/db/amethpong.db");
    this._tableName = tableName;
  }

  async find(toSearch: string, arg: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE ${toSearch}${arg}`;
    const row = this._db.get(sql);
    return row ? (row as T) : null;
  }

  async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this._tableName} WHERE id=?`;
    // const res = this._db.run("SELECT * FROM ? WHERE id=?", [this._tableName, id]);
    const row = this._db.get(sql, [id]);
    return row ? (row as T) : null;
  }

  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this._tableName}`;
    return new Promise<T[]>((resolve, reject) => {
      // need to promisify!!! // import promisify...
      this._db.all(sql, (err, rows) => {
        return err ? reject(err) : resolve(rows as T[]);
      });
    });
  }

  async create(data: Partial<T>): Promise<T> {
    let query = `INSERT INTO ${this._tableName} (`;
    Object.keys(data).forEach((element) => {
      query += element + ", ";
    });
    query += ") VALUES(";
    Object.values(data).forEach((element) => {
      query += "'" + element + "', ";
    });
    query += ")";
    console.log(query);
    return new Promise<T>((resolve, reject) => {});
  }
  // async update(id: number, data: Partial<T>): Promise<T> { }
  // async delete(id: number): Promise<boolean> { }
}
