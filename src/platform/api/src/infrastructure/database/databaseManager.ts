import { Database } from "sqlite3";

export class DatabaseManager {
  private static instance: Database;
  
  static getInstance(path: string): Database {
      if (!this.instance) {
          this.instance = new Database(path);
      }
      return this.instance;
  }
}