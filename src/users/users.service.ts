import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { v4 } from 'uuid';
@Injectable()
export class UsersService {
  constructor(@Inject('USER') private users: User[]) {}

  createUser(creatUsersDto: CreateUsersDto): User {
    const user = { id: v4(), ...creatUsersDto };

    this.users.push(user);
    return user;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.users.find((user) => user.id === id);
    if (!user) {
      throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  updateUser(id: string, updateUserDto: UpdateUserDto): User {
    const user = this.users.findIndex((user) => user.id === id);
    if (user !== -1) {
      this.users[user] = {
        ...this.users[user],
        ...updateUserDto,
      };
      return this.users[user];
    }
    throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
  }

  deleteUser(id: string): User {
    const user = this.users.findIndex((user) => user.id === id);
    if (user !== -1) {
      const deletedUser = this.users[user];
      this.users.splice(user, 1);
      return deletedUser;
    }
    throw new HttpException('BadRequest', HttpStatus.BAD_REQUEST);
  }
}
