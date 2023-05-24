import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedDto } from './DTO/paginated.dto';
import { PaginationQueryDto } from './DTO/paginatedQuery.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(creatUsersDto: CreateUsersDto): Promise<User> {
    const user = await this.userRepository.create(creatUsersDto);
    return this.userRepository.save(user);
  }

  async getAllUsers(query: PaginationQueryDto): Promise<PaginatedDto<User>> {
    const { page, pageSize } = query;
    const pageItems =
      typeof pageSize === 'string' ? parseInt(pageSize, 10) : 10;
    const currentPage = typeof page === 'string' ? parseInt(page, 10) : 1; // Default to the first page if page is not provided
    const offset = (currentPage - 1) * pageItems;
    const [users, totalCount] = await Promise.all([
      this.userRepository.find({
        skip: offset,
        take: pageItems,
      }),
      this.userRepository.count(),
    ]);

    return {
      total: totalCount,
      limit: pageItems,
      offset,
      results: users,
    };
  }

  // async getAllUsers(): Promise<User[]> {
  //   return await this.userRepository.find();
  // }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.save({ id, ...updateUserDto });
  }

  async deleteUser(id: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with the id ${id} not found`);
    }
    await this.userRepository.remove(user);
    return 'User deleted successfully.';
  }
}
