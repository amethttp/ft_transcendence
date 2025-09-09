export interface IBaseRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[] | null>;
  create(data: Partial<T>): Promise<number | null>;
  update(id: number, data: Partial<T>): Promise<number | null>;
  delete(id: number): Promise<boolean>;
  dbBegin(): any;
  dbRollback(): any;
  dbCommit(): any;
}