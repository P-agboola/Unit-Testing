import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(creatUsersDto: CreateUsersDto): Promise<User> {
    const user = await this.userRepository.create(creatUsersDto);
    return this.userRepository.save(user);
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

  // async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
  //   const user = await this.userRepository.findOneBy({ id });
  //   const email =
  //     updateUserDto.email === undefined ? user.email : updateUserDto.email;
  //   const userName =
  //     updateUserDto.userName === undefined
  //       ? user.userName
  //       : updateUserDto.userName;
  //   const updatedUser = { email, userName };
  //   return this.userRepository.save(updatedUser);
  // }
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update({ id }, updateUserDto);
    const updatedUser = await this.userRepository.findOneBy({ id });
    return updatedUser;
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
