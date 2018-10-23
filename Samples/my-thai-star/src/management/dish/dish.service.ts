import { Injectable } from '@nestjs/common';
import { BaseService } from 'shared/base.service';
import { Dish } from './models/dish.entity';
import { Repository } from 'typeorm';
import { DishVm } from './models/view-models/dish-vm';

@Injectable()
export class DishService extends BaseService<Dish> {
  constructor() {
    super();
    this._repository = new Repository<Dish>();
  }

  async createDish(item: DishVm): Promise<Dish> {
    const entity = this._repository.create(item);
    return this._repository.save(entity);
  }
}
