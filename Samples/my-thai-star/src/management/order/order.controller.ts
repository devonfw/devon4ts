import { Controller } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';

@Controller('ordermanagement/v1')
@ApiUseTags('Order')
export class OrderController {}
