import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../model/entities/user.entity';
import { genSalt, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { roles } from '../../auth/model/roles.enum';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        username,
      },
    });
  }

  async registerUser(user: User): Promise<User> {
    const actualUser = await this.findOne(user.username!);

    if (actualUser) {
      throw new Error('User already exists');
    }

    const salt = await genSalt(12);
    const hashPass = await hash(user.password, salt);

    return plainToClass(
      User,
      await this.userRepository.save({
        username: user.username,
        password: hashPass,
        role: roles.USER,
      }),
    );
  }
}
