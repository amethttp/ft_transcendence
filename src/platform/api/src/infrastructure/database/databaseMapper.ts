import { AEntity } from "../../domain/entities/AEntity";

export class DatabaseMapper {
  private static extractValue(value: any): any {
    if (typeof value === 'object' && value !== null && 'id' in value) {
      return value.id;
    }
    return value;
  }

  public static toDatabase(entries: [string, any][], entitySchema: Record<string, string>): Record<string, any> {
    let dbRecord: Record<string, any> = {};

    for (const [key, value] of entries) {
      if (key in entitySchema) {
        dbRecord[entitySchema[key]] = DatabaseMapper.extractValue(value);
      }
    }

    return dbRecord;
  }

  private static isValidObj(value: any): boolean {
    if (typeof value === "object" && value !== null && value instanceof AEntity) {
      return true;
    }

    return false;
  }

  private static mapObjectJoins(entries: [string, any][], tableName: string, schema: Record<string, string>, counter: number): string {
    let queryJoin = "";
    for (const [key, value] of entries) {
      if (key in schema) {
        if (typeof value === "object" && this.isValidObj(value)) {
          counter++;
          const adjustedTableName = schema[key].slice(0,-3);
          queryJoin += "LEFT JOIN " + value.tableName + ` ${adjustedTableName}${counter}` + " ON " + tableName + "." + adjustedTableName + "_id = " + adjustedTableName + counter + ".id\n";
          queryJoin += this.mapObjectJoins(Object.entries(value), adjustedTableName + counter, value.schema, counter);
        }
      }
    }
    return queryJoin;
  }

  private static mapObjectSelect(entries: [string, any][], tableName: string, schema: Record<string, string>, counter: number): string {
    let querySelect = "";
    for (const [key, value] of entries) {
      if (key in schema) {
        querySelect += "\'" + key.toString() + "\',"; // DO NOT replace the single quotes
        if (typeof value === "object" && this.isValidObj(value)) {
          counter++;
          const adjustedTableName = schema[key].slice(0,-3);
          querySelect += "json_object(" + this.mapObjectSelect(Object.entries(value), adjustedTableName + counter, value.schema, counter) + "),";
        } else {
          querySelect += tableName + "." + schema[key] + ",";
        }
      }
    }
    if (querySelect[querySelect.length - 1] === ",") {
      querySelect = querySelect.slice(0, -1);
    }

    return querySelect;
  }

  public static mapEntityToQuery(entity: AEntity): string {
    const entries = Object.entries(entity);
    const querySelect = this.mapObjectSelect(entries, entity.tableName, entity.schema, 0);
    const queryJoin = this.mapObjectJoins(entries, entity.tableName, entity.schema, 0);

    let sqlRes = `
      SELECT
        json_object(
        ${querySelect}
        ) as result
      FROM ${entity.tableName}
      ${queryJoin}
    `;

    return sqlRes;
  }
}
