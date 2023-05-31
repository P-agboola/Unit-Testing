import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;
  const _user = {
    id: 2,
    userName: 'Test',
    email: 'test@google.com',
    profile: {
      gender: 'male',
      firstName: 'test',
      lastName: 'test',
      occupation: 'developer',
      phoneNumber: '09182734628',
    },
  };

  const mockUserRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 2, ...user })),
    find: jest.fn(() => Promise.resolve([])),
    count: jest.fn(() => Promise.resolve(0)),
    findOne: jest.fn(async ({ id, relations }) => {
      if (id === 5) {
        throw new NotFoundException('User not found');
      }
      return Promise.resolve(_user);
    }),

    findOneBy: jest.fn(async ({ id }) => {
      if (id >= 3) {
        throw new NotFoundException('User not found');
      }
      return Promise.resolve(_user);
    }),
    remove: jest.fn(() => Promise.resolve()),
  };

  const testUser: CreateUsersDto = {
    userName: 'Test',
    email: 'test@google.com',
  };

  const updateTestUser: UpdateUserDto = {
    userName: 'Test Example',
    email: 'testExample@google.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.createUser(testUser);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(mockUserRepository.create).toHaveBeenCalledWith(testUser);
    expect(mockUserRepository.save).toHaveBeenCalledWith(testUser);
    expect(user.email).toEqual(_user.email);
    expect(user.userName).toEqual(_user.userName);
    expect(user.id).toEqual(_user.id);
  });

  it('should return all users', async () => {
    const users = [
      { id: 1, userName: 'Test Example', email: 'testExample@google.com' },
      { id: 2, userName: 'Test', email: 'test@google.com' },
    ];
    const totalCount = 2;

    // Mock the userRepository.find method
    mockUserRepository.find.mockResolvedValue(users);

    // Mock the userRepository.count method
    mockUserRepository.count.mockResolvedValue(totalCount);

    const query = { page: 1, pageSize: 10 };
    const result = await service.getAllUsers(query);

    expect(result.total).toEqual(totalCount);
    expect(result.limit).toEqual(query.pageSize);
    expect(result.offset).toEqual((query.page - 1) * query.pageSize);
    expect(result.results).toEqual(users);
    expect(mockUserRepository.find).toHaveBeenCalledWith({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    expect(mockUserRepository.count).toHaveBeenCalled();
  });

  // it('should return all users', async () => {
  //   const users = await service.getAllUsers({
  //     page: 1,
  //   });
  //   expect(users).toBeDefined();
  //   expect(mockUserRepository.find).toHaveBeenCalled();
  //   expect(mockUserRepository.count).toHaveBeenCalled();
  // });

  it('should get a user by id', async () => {
    const user = await service.getUserById(2);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        relations: ['profile'],
      }),
    );
    expect(user).toEqual(_user);
  });

  it('should return NotFound if the user does not exist to get', async () => {
    await expect(service.getUserById(5)).rejects.toThrowError(
      NotFoundException,
    );
    await expect(service.getUserById(5)).rejects.toThrowError('User not found');
  });

  it('should update a user', async () => {
    const updateduser: User = await service.updateUser(2, updateTestUser);
    expect(updateduser).toHaveProperty('id', 2);
    expect(mockUserRepository.findOne).toBeCalledWith(
      expect.objectContaining({ where: { id: 2 } }),
    );
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(updateduser.userName).toEqual(updateTestUser.userName);
    expect(updateduser.email).toEqual(updateTestUser.email);
  });

  it('should return Notfound if the user does not exist to be updated', () => {
    expect(service.updateUser(11, updateTestUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a user', async () => {
    const deletedUser = await service.deleteUser(2);
    expect(deletedUser).toEqual('User deleted successfully.');
    expect(mockUserRepository.findOne).toBeCalledWith(
      expect.objectContaining({ where: { id: 2 } }),
    );
    expect(mockUserRepository.remove).toBeCalled();
  });

  it('should return Notfound if the user does not exist to be deleted', async () => {
    expect(service.deleteUser(11)).rejects.toThrow(NotFoundException);
  });
});
