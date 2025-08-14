export class DatabaseMapper {
  private _entitySchema!: { [key: string]: string };

  constructor(entitySchema: { [key: string]: string }) {
    this._entitySchema = entitySchema;
  }

  private extractValue(value: any): any {
    if (typeof value === 'object' && value !== null && 'id' in value) {
        return value.id;
    }
    return value;
  }

  public toDatabase(entries: [string, any][]): { [key: string]: any } {
    let dbRecord: { [key: string]: string } = {};
  
    for (const [key, value] of entries) {
      if (key in this._entitySchema) {
        dbRecord[this._entitySchema[key]] = this.extractValue(value);
      }
    }
  
    return dbRecord;
  }
}
