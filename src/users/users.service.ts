import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(creatUsersDto: CreateUsersDto): Promise<User> {
    const user = await this.userRepository.create(creatUsersDto);
    try {
      return this.userRepository.save(user);
    } catch (error) {
      console.log(error);

      // if (error.code === '23505') {
      //   console.log(error);
      //   throw new ConflictException('Email already Exist');
      // } else {
      //   throw new InternalServerErrorException();
      // }
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    const email =
      updateUserDto.email === undefined ? user.email : updateUserDto.email;
    const userName =
      updateUserDto.userName === undefined
        ? user.userName
        : updateUserDto.userName;
    const updatedUser = { email, userName };
    return await this.userRepository.save(updatedUser);
  }

  async deleteUser(id: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id });
    const deleteUser = await this.userRepository.delete(user.id);
    if (deleteUser) {
      return 'User deleted';
    }
    throw new InternalServerErrorException();
  }
}
