import { Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseModel } from 'shared/base.model';
import { OrderLine } from './orderLine.entity';
import { Booking } from 'management/booking/models/booking.entity';
import { InvitedGuest } from 'model/invitedGuest/invitedGuest.entity';

@Entity()
export class Order extends BaseModel<Order> {
  @ManyToOne(type => Booking, { eager: true })
  @JoinColumn({ name: 'idReservation' })
  booking: Booking;

  @ManyToOne(type => InvitedGuest, { eager: true })
  @JoinColumn({ name: 'idInvitationGuest' })
  invitedGuest: InvitedGuest;

  @OneToMany(type => OrderLine, orderLine => orderLine.Order)
  orderLines: Array<OrderLine>;
}
