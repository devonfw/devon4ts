import { Repository } from 'typeorm';
export abstract class BaseService<T> {
  protected _repository!: Repository<T>;
  async findAll(filter = {}) {
    return await this._repository.find(filter);
  }
  async findById(id: any) {
    return await this._repository.findOne(id);
  }
  async delete(item: T) {
    const exists = await this._repository.findOne(item);
    if (exists) {
      return await this._repository.remove(item);
    }
    return exists;
  }
  async deleteById(id: any) {
    const exists = await this._repository.findOne(id);
    if (exists) {
      return await this._repository.remove(exists);
    }
    return exists;
  }
  async update(id: any, item: any) {
    const exists = await this._repository.findOne(id);
    if (exists) {
      await this._repository.update(id, item);
    }
    return exists;
  }
} // this error is a known bug not yet fixed : https://github.com/Microsoft/TypeScript/issues/21592
