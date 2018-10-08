import 'automapper-ts/dist/automapper';
import { Repository, DeepPartial } from 'typeorm';

export abstract class BaseService<T> {
  protected _repository: Repository<T>;
  protected _mapper: AutoMapperJs.AutoMapper;

  private TName: string;

  setTname(name: string) {
    this.TName = name;
  }

  async map<K>(
    object: Partial<T> | Partial<T[]>,
    isArray: boolean = false,
    sourceKey?: string,
    destinationKey?: string,
  ): Promise<K> {
    const _sourcekey = isArray
      ? `${sourceKey || this.TName}[]`
      : sourceKey || this.TName;
    const _destinationKey = isArray
      ? `${destinationKey || this.TName}Vm[]`
      : destinationKey || `${this.TName}Vm`;
    return this._mapper.map(_sourcekey, _destinationKey, object);
  }

  async findAll(filter = {}): Promise<T[]> {
    return await this._repository.find(filter);
  }

  async findById(id: any): Promise<T> {
    return await this._repository.findOne(id);
  }

  async delete(item: T): Promise<T | null> {
    return await this._repository.delete(item);
  }

  async deleteById(id: any): Promise<T | null> {
    const exists = await this._repository.findOne(id);
    const deleted = await this._repository.delete(id);
    if (deleted) return exists;
    return null;
  }

  async update(id: number, item: DeepPartial<T>): Promise<T | null> {
    let exists = await this._repository.findOne(id);
    const updated = await this._repository.update(id, item);
    exists = await this._repository.findOne(id);
    if (updated) return exists;
    return null;
  }
}
