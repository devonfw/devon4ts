import { BaseModelVM } from 'shared/base.model';
import { ApiModelPropertyOptional, ApiModelProperty } from '@nestjs/swagger';

export class BookingVm extends BaseModelVM {
  @ApiModelPropertyOptional()
  userId?: number;
  @ApiModelProperty()
  name: string;
  @ApiModelProperty()
  reservationToken: string;
  @ApiModelProperty()
  comments: string;
  @ApiModelProperty()
  bookingDate: Date;
  @ApiModelProperty()
  expirationDate: Date;
  @ApiModelProperty()
  canceled: boolean;
  @ApiModelProperty()
  idReservationType: number;
  @ApiModelPropertyOptional()
  tableId?: number;
  @ApiModelProperty()
  email: string;
  @ApiModelProperty()
  assistants: number;
}
