import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';

describe('UsersService', () => {
  let service: UsersService;
  const createUserDto: CreateUsersDto = {
    firstName: 'Test',
    email: 'test@google.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should  create a user', async () => {
    const user: User = await service.createUser(createUserDto);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user.email).toEqual(createUserDto.email);
    expect(user.firstName).toEqual(createUserDto.firstName);
  });
});
