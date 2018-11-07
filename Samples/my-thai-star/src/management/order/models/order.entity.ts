import { Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseModel } from 'shared/base.model';
import { OrderLine } from './orderLine.entity';
import { Booking } from 'management/booking/models/booking.entity';
import { InvitedGuest } from 'model/invitedGuest/invitedGuest.entity';

@Entity()
export class Order extends BaseModel<Order> {
  @ManyToOne(type => Booking, { eager: true, nullable: true })
  @JoinColumn({ name: 'idReservation' })
  booking: Booking;

  @OneToOne(type => InvitedGuest, { eager: true, nullable: true })
  @JoinColumn({ name: 'idInvitedGuest' })
  invitedGuest: InvitedGuest;

  @OneToMany(type => OrderLine, orderLine => orderLine.order, {
    nullable: true,
  })
  orderLines: Array<OrderLine>;

  @OneToOne(type => Booking, { nullable: true })
  @JoinColumn({ name: 'idHost', referencedColumnName: 'id' })
  host: Booking;
}
