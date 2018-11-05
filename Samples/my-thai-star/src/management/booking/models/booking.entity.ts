import { BaseModel } from 'shared/base.model';
import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'management/user/models/user.entity';
import { Table } from 'model/table/table.entity';
import { InvitedGuest } from 'model/invitedGuest/invitedGuest.entity';
import { userInfo } from 'os';

@Entity()
export class Booking extends BaseModel<Booking> {
  @ManyToOne(type => User, user => user.bookings)
  user: User;

  @Column({ type: 'nvarchar', length: 120 })
  name: string;
  @Column({ type: 'nvarchar', length: 60 })
  reservationToken: string;
  @Column({ type: 'nvarchar', length: 255 })
  comments: string;
  @Column({ type: 'datetime' })
  bookingDate: Date;
  @Column({ type: 'datetime' })
  expirationDate: Date;
  @Column({ type: 'datetime' })
  creationDate: Date;
  @Column({ type: 'int' })
  canceled: boolean;
  @Column({ type: 'int' })
  idReservationType: number;
  @ManyToOne(type => Table, { eager: true })
  @JoinColumn({ name: 'TableId', referencedColumnName: 'id' })
  table: Table;
  @Column({ type: 'nvarchar', length: 255 })
  email: string;
  @Column({ type: 'int' })
  assistants: number;
  @OneToMany(type => InvitedGuest, invitedGuest => invitedGuest.booking)
  invitedGuests: Array<InvitedGuest>;
}
