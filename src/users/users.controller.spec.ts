import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const createUserDto: CreateUsersDto = {
    firstName: 'Test',
    email: 'test@google.com',
  };
  const users = [{ id: Date.now(), ...createUserDto }];

  const mockUserService = {
    createUser: jest.fn((user: CreateUsersDto) => {
      return {
        id: Date.now(),
        ...user,
      };
    }),

    getAllUsers: jest.fn(() => {
      return Promise.resolve(users);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await controller.createUser(createUserDto);
    expect(user).toBeDefined;
    expect(mockUserService.createUser).toHaveBeenCalled();
    expect(user).toEqual({
      id: expect.any(Number),
      ...createUserDto,
    });
  });

  it('should get all users', async () => {
    const allUser = await controller.getAllUsers();
    expect(users).toBeDefined();
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(allUser).toEqual(users);
  });
});
