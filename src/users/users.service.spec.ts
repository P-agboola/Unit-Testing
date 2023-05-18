import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TestUser, User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const testUser: CreateUsersDto = {
    name: 'Test',
    email: 'test@google.com',
  };
  const updateTestUser: UpdateUserDto = {
    name: 'Test Example',
    email: 'testExample@google.com',
  };
  const _user = {
    id: '2',
    name: 'Test',
    email: 'test@google.com',
  };
  beforeEach(async () => {
    const _TestUser = [
      {
        id: '2',
        name: 'Test',
        email: 'test@google.com',
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'USER',
          useValue: _TestUser,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should  create a user', async () => {
    const user: User = await service.createUser(testUser);
    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user.email).toEqual(testUser.email);
    expect(user.name).toEqual(testUser.name);
  });

  it('should return all users', async () => {
    const users: User[] = await service.getAllUsers();
    expect(users).toBeDefined();
    expect(users).toEqual(TestUser);
  });

  it('should get a user by id', async () => {
    const user: User = await service.getUserById('2');
    expect(user).toEqual(_user);
  });

  it('should return bad request if the user does not exist to get', () => {
    expect(service.getUserById('11')).rejects.toThrow(NotFoundException);
  });
  it('should update a user', async () => {
    const updateduser: User = await service.updateUser('2', updateTestUser);
    expect(updateduser).toHaveProperty('id', '2');
    expect(updateduser.name).toEqual(updateTestUser.name);
    expect(updateduser.email).toEqual(updateTestUser.email);
  });

  it('should return bad request if the user does not exist to be updated', () => {
    expect(service.updateUser('11', updateTestUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a user', async () => {
    const deletedUser: User = await service.deleteUser('2');
    expect(deletedUser).toEqual(_user);
  });

  it('should return bad request if the user does not exist to be deleted', () => {
    expect(service.deleteUser('11')).rejects.toThrow(NotFoundException);
  });
});
