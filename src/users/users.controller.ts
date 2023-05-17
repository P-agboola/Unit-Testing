import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllUsers(): User[] {
    return this.usersService.getAllUsers();
  }

  @Post()
  createUser(@Body() creatUsersDto: CreateUsersDto): User {
    return this.usersService.createUser(creatUsersDto);
  }
}
