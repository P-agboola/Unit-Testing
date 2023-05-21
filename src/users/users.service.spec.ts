import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 2, ...user })),
    find: jest.fn(() => Promise.resolve([])),

    findOneBy: jest.fn((_id) => {
      const { id } = _id;
      if (id) {
        return Promise.resolve(_user);
      }
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
  const _user = {
    id: 2,
    userName: 'Test',
    email: 'test@google.com',
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
    // mockUserRepository.create.mockReturnValue(_user);
    // mockUserRepository.save.mockResolvedValue(_user);
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
    mockUserRepository.findOneBy.mockResolvedValue(_user);
    const user = await service.getUserById(2);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith(2);
    expect(user).toEqual(_user);
  });

  it('should return bad request if the user does not exist to get', async () => {
    mockUserRepository.findOneBy.mockImplementation();
    expect(mockUserRepository.findOneBy).toBeCalledWith({ id: 3 });
    expect(service.getUserById(3)).rejects.toThrowError(NotFoundException);
  });
  // it('should update a user', async () => {
  //   const updateduser: User = await service.updateUser(2, updateTestUser);
  //   expect(updateduser).toHaveProperty('id', 2);
  //   expect(mockUserRepository.findOneBy).toBeCalledWith({ id: 2 });
  //   expect(mockUserRepository.save).toBeCalled();
  //   expect(updateduser.userName).toEqual(updateTestUser.userName);
  //   expect(updateduser.email).toEqual(updateTestUser.email);
  // });

  // it('should return bad request if the user does not exist to be updated', () => {
  //   expect(service.updateUser(11, updateTestUser)).rejects.toThrow(
  //     NotFoundException,
  //   );
  // });

  // it('should delete a user', async () => {
  //   // mockUserRepository.create.mockReturnValue(_user);
  //   // mockUserRepository.delete.mockResolvedValue();
  //   const deletedUser = await service.deleteUser(2);
  //   expect(mockUserRepository.findOneBy).toBeCalledWith({ id: 2 });
  //   expect(mockUserRepository.delete).toBeCalled();
  //   expect(deletedUser).toEqual(_user);
  // });

  // it('should return bad request if the user does not exist to be deleted', () => {
  //   expect(service.deleteUser(11)).rejects.toThrow(NotFoundException);
  // });
});
