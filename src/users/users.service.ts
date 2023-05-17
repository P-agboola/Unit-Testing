import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';

@Injectable()
export class UsersService {
  users: User[] = [];

  createUser(creatUsersDto: CreateUsersDto): User {
    const user = { id: Date.now(), ...creatUsersDto };

    this.users.push(user);
    return user;
  }

  getAllUsers(): User[] {
    return this.users;
  }
}
