export abstract class AEntity {
  static readonly tableName: string;
  static readonly entitySchema: { [key: string]: string };
}
