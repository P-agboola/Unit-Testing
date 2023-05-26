import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './DTO/updateUser.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedDto } from './DTO/paginated.dto';
import { ApiPaginatedResponse } from './decorators/apiResponse.decorator';
import { PaginationQueryDto } from './DTO/paginatedQuery.dto';

@ApiBearerAuth()
@ApiExtraModels(PaginatedDto)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOkResponse({ description: `return user []` })
  @Get()
  @ApiPaginatedResponse(User)
  async getAllUsers(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedDto<User>> {
    console.log('query');
    return this.usersService.getAllUsers(query);
  }

  @ApiCreatedResponse({ description: 'User created successfully' })
  @Post()
  async createUser(@Body() creatUsersDto: CreateUsersDto): Promise<User> {
    return await this.usersService.createUser(creatUsersDto);
  }

  @ApiOkResponse({ description: `User id found and return` })
  @ApiNotFoundResponse({ description: `User id not found` })
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return await this.usersService.getUserById(id);
  }

  @ApiOkResponse({ description: `User id found and updated` })
  @ApiNotFoundResponse({ description: `User id not found` })
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOkResponse({ description: `User id found and deleted` })
  @ApiNotFoundResponse({ description: `User id not found` })
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<string> {
    return await this.usersService.deleteUser(id);
  }
}
