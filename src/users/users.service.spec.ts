import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TestUser, User } from './entities/user.entity';
import { CreateUsersDto } from './DTO/createUser.dto';
import { UpdateUserDto } from './DTO/updateUser.dto';
import { HttpException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  // const users: User[] = [{ id: '2', name: 'Test', email: 'test@google.com' }];

  const testUser: CreateUsersDto = {
    name: 'Test',
    email: 'test@google.com',
  };
  const updateTestUser: UpdateUserDto = {
    name: 'Test Example',
    email: 'testExample@google.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'USER',
          useValue: TestUser,
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
    const createdUser: User = await service.createUser(testUser);
    const user: User = await service.getUserById(createdUser.id);
    expect(user).toEqual(createdUser);
  });

  it('should return bad request if the user does not exist to get', async () => {
    const deletedUser: User = await service.deleteUser('1');
    expect(deletedUser).rejects.toThrowError(HttpException);
  });
  it('should update a user', async () => {
    const createdUser: User = await service.createUser(testUser);
    const updateduser: User = await service.updateUser(
      createdUser.id,
      updateTestUser,
    );
    expect(updateduser).toHaveProperty('id', createdUser.id);
    expect(updateduser.name).toEqual(updateTestUser.name);
    expect(updateduser.email).toEqual(updateTestUser.email);
  });
  it('should return bad request if the user does not exist to be updated', async () => {
    const updateduser: User = await service.updateUser('1', updateTestUser);
    expect(updateduser).rejects.toThrow(HttpException);
  });

  it('should delete a user', async () => {
    const createdUser: User = await service.createUser(testUser);
    const deletedUser: User = await service.deleteUser(createdUser.id);
    expect(deletedUser).toEqual(createdUser);
  });

  it('should return bad request if the user does not exist to be deleted', async () => {
    const deletedUser: User = await service.deleteUser('1');
    expect(deletedUser).rejects.toThrow(HttpException);
  });
});
