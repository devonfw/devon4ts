import { Controller } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';

@Controller('bookingmanagement/v1')
@ApiUseTags('Booking')
export class BookingController {}
