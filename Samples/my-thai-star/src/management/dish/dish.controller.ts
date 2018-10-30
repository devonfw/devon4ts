import { Controller, Get } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { DishResponse } from 'shared/interfaces';

@Controller('/services/rest/dishmanagement/v1')
@ApiUseTags('Dish')
export class DishController {}
