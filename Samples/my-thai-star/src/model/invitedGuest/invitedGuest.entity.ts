import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { BaseModel } from 'shared/base.model';
import { Booking } from 'management/booking/models/booking.entity';

@Entity()
export class InvitedGuest extends BaseModel<InvitedGuest> {
  @ManyToOne(type => Booking, { eager: true })
  booking: Booking;
  @Column({ type: 'nvarchar', length: 60 })
  guestToken: string;
  @Column({ type: 'nvarchar', length: 60 })
  email: string;
  @Column({ type: 'int' })
  accepted: boolean;
  @Column({ type: 'datetime' })
  modificationDate: Date;
}
