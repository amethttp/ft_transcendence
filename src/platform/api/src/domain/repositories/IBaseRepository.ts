export interface IBaseRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[] | null>;
  create(data: Partial<T>): Promise<T | null>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}