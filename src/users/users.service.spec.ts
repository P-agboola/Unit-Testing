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
  };

  const mockUserRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 2, ...user })),
    find: jest.fn(() => Promise.resolve([])),

    findOneBy: jest.fn(async ({ id }) => {
      if (id >= 3) {
        throw new NotFoundException('User not found');
      }
      return Promise.resolve(_user);
    }),

    delete: jest.fn((id: number) =>
      Promise.resolve({
        id,
        message: 'User deleted',
      }),
    ),
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

  it('should  create a user', async () => {
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
    const users: User[] = await service.getAllUsers();
    expect(users).toBeDefined();
    expect(mockUserRepository.find).toHaveBeenCalled();
  });

  it('should get a user by id', async () => {
    const user = await service.getUserById(2);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      id: 2,
    });
    expect(user).toEqual(_user);
  });

  it('should return bad request if the user does not exist to get', async () => {
    expect(service.getUserById(5)).rejects.toThrow(NotFoundException);
  });
  it('should update a user', async () => {
    const updateduser: User = await service.updateUser(2, updateTestUser);
    expect(updateduser).toHaveProperty('id', 2);
    expect(mockUserRepository.findOneBy).toBeCalledWith({ id: 2 });
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(updateduser.userName).toEqual(updateTestUser.userName);
    expect(updateduser.email).toEqual(updateTestUser.email);
  });

  it('should return bad request if the user does not exist to be updated', () => {
    expect(service.updateUser(11, updateTestUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a user', async () => {
    const deletedUser = await service.deleteUser(2);
    expect(deletedUser).toEqual('User deleted');
    expect(mockUserRepository.findOneBy).toBeCalledWith({ id: 2 });
    expect(mockUserRepository.delete).toBeCalled();
  });

  it('should return bad request if the user does not exist to be deleted', async () => {
    expect(service.deleteUser(11)).rejects.toThrow(NotFoundException);
  });
});
