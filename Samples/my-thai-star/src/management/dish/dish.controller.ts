import { Controller } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';

@Controller('dishmanagement/v1')
@ApiUseTags('Dish')
export class DishController {}
