import { User } from '~app/core/user/model/entities/user.entity';

export class UserPayload implements Pick<User, 'id' | 'username' | 'role'> {
  id!: number;
  username!: string;
  role!: number;
}
