import { BaseModelVM } from 'shared/base.model';
import { User } from 'management/user/models/user.entity';
import { ApiModelPropertyOptional, ApiModelProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

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
  creationDate: Date;
  @ApiModelProperty()
  canceled: boolean;
  @ApiModelProperty()
  idReservationType: number;
  @ApiModelPropertyOptional()
  tableId?: number;
  @Column({ type: 'nvarchar', length: 255 })
  email: string;
  @Column({ type: 'int' })
  assistants: number;
}
