import { BaseModelVM } from 'shared/base.model';
import { ApiModelPropertyOptional, ApiModelProperty } from '@nestjs/swagger';

export class BookingVm extends BaseModelVM {
  @ApiModelPropertyOptional()
  assistants?: number;
  @ApiModelProperty()
  email: string;
  @ApiModelProperty()
  name: string;
  @ApiModelPropertyOptional()
  comment?: string;
  @ApiModelProperty()
  bookingDate: string;
  @ApiModelProperty()
  bookingType: number;
}

export class CreateBookingVm {
  booking: BookingVm;
}

export class BookingDTO {
  @ApiModelPropertyOptional()
  id?: number;
  @ApiModelPropertyOptional()
  creationDate?: Date;
  @ApiModelPropertyOptional()
  assistants?: number;
  @ApiModelPropertyOptional()
  bookingToken: string;
  @ApiModelProperty()
  email: string;
  @ApiModelProperty()
  name: string;
  @ApiModelPropertyOptional()
  comment?: string;
  @ApiModelPropertyOptional()
  canceled: boolean;
  @ApiModelProperty()
  bookingDate: Date;
  @ApiModelProperty()
  bookingType: string;
  @ApiModelProperty()
  expirationDate: Date;
  @ApiModelPropertyOptional()
  userId?: number;
  @ApiModelPropertyOptional()
  orderId?: number;
  @ApiModelPropertyOptional()
  tableId?: number;
  @ApiModelPropertyOptional()
  revision?: number;
}

export class BookingResponseVm {
  @ApiModelPropertyOptional()
  pagination?: { size: number; page: number; total: number };
  @ApiModelPropertyOptional()
  result: BookingDTO;
}
