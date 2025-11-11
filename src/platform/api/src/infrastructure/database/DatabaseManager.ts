import { Database } from "sqlite3";

export class DatabaseManager {
  private static instance: Database;
  
  static getInstance(path: string): Database {
      if (!this.instance) {
          this.instance = new Database(path);
          this.instance.exec("PRAGMA foreign_keys = ON;");
      }
      return this.instance;
  }
}