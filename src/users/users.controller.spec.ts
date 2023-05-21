import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const testUser: CreateUsersDto = {
    userName: 'Test',
    email: 'test@google.com',
  };
  const updateTestUser: UpdateUserDto = {
    userName: 'Test Example',
    email: 'testExample@google.com',
  };
  const users = [{ id: 2, ...testUser }];

  const mockUserService = {
    createUser: jest.fn((user: CreateUsersDto) => {
      return {
        id: 2,
        ...user,
      };
    }),

    getAllUsers: jest.fn(() => {
      return Promise.resolve(users);
    }),

    getUserById: jest.fn((id: number) => {
      return Promise.resolve({ id, ...testUser });
    }),

    updateUser: jest.fn((id: number, updateTestUser) => {
      return Promise.resolve({
        id,
        ...updateTestUser,
      });
    }),

    deleteUser: jest.fn((id: number) => {
      return Promise.resolve({
        id,
        ...testUser,
        message: 'Deleted Successfully',
      });
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
    const user = await controller.createUser(testUser);
    expect(user).toBeDefined;
    expect(mockUserService.createUser).toHaveBeenCalled();
    expect(user).toEqual({
      id: 2,
      ...testUser,
    });
  });

  it('should get all users', async () => {
    const allUser = await controller.getAllUsers();
    expect(users).toBeDefined();
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(allUser).toEqual(users);
  });

  it('should get a user', async () => {
    const user = await controller.getUserById(2);
    expect(user).toBeDefined();
    expect(mockUserService.getUserById).toHaveBeenCalledWith(2);
    expect(user).toEqual({ id: expect.any(Number), ...testUser });
  });

  it('should update user', async () => {
    const user = await controller.updateUser(2, updateTestUser);
    expect(user).toBeDefined();
    expect(mockUserService.updateUser).toHaveBeenCalledWith(2, updateTestUser);
    expect(user).toEqual({ id: expect.any(Number), ...updateTestUser });
  });

  it('should delete user', async () => {
    const user = await controller.deleteUser(2);
    expect(user).toBeDefined();
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(2);
    expect(user).toEqual({
      id: expect.any(Number),
      ...testUser,
      message: 'Deleted Successfully',
    });
  });
});
