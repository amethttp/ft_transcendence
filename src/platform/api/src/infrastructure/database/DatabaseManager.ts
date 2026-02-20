import { Database } from "sqlite3";

export class DatabaseManager {
  private static instance: Database;
  
  static getInstance(path: string): Database {
      if (!this.instance) {
        this.instance = new Database(path);

        this.instance.serialize(() => {
          this.instance.run("PRAGMA foreign_keys = ON;");
          this.instance.run("PRAGMA journal_mode = WAL;");
          this.instance.run("PRAGMA synchronous = NORMAL;");
        });
      }
      return this.instance;
  }
}