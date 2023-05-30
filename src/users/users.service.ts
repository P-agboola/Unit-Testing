import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const user = this.userRepository.create(creatUsersDto);
      const createdUser = await this.userRepository.save(user);
      return createdUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException(error.message);
    }
  }

  async getAllUsers(query: PaginationQueryDto): Promise<PaginatedDto<User>> {
    const { page, pageSize } = query;
    const pageItems = pageSize || 10;
    const currentPage = page || 1; // Default to the first page if page is not provided
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

  async getUserById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
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
