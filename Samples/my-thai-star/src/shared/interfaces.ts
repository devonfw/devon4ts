import { Dish } from 'management/dish/models/dish.entity';

// FILTERS

export class Filter {
  pagination?: Pagination;
  isFav: boolean;
  searchBy: string;
  sort: { name: string; direction: string }[];
  maxPrice: number;
  minLikes: number;
  categories: { id: string }[];
}

export class FilterCockpit {
  pagination?: Pagination;
  sort?: Sorting[];
  bookingDate: string;
  email: string;
  bookingToken: number;
}

export class Pagination {
  size: number;
  page: number;
  total: number;
}

export class Sorting {
  name: string;
  direction: string;
}

// DISHES
export class ExtraInfo {
  id: number;
  name: string;
  price: number;
  selected: boolean;
}

export interface DishView {
  dish: PlateView;
  image: { content: string };
  extras: ExtraView[];
  categories?: { id: string }[];
}

export interface PlateView {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface ExtraView {
  id: number;
  name: string;
  price: number;
  selected?: boolean;
}

export interface DishResponse {
  pagination: Pagination;
  result: DishView[];
}

// BOOKING
export class BookingInfo {
  booking: ReservationInfo;
  invitedGuests?: {
    [index: number]: { email: string };
  };
}

export class ReservationInfo {
  bookingDate: string;
  name: string;
  email: string;
  bookingType: number;
  assistants?: number;
}

export class FriendsInvite {
  email: string;
  acceptance: string;
}

export class OrderInfo {
  orderLine: OrderLineInfo;
  extras: number[];
}

export class OrderLineInfo {
  dishId: number;
  amount: number;
  comment: string;
}

export class OrderListInfo {
  booking: { bookingToken: string };
  orderLines: OrderInfo[];
}

// LOGIN
export class LoginInfo {
  username: string;
  password: string;
  role: string;
  token?: string;
}

export class Role {
  name: string;
  permission: number;
}
