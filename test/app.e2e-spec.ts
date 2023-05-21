import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUsersDto } from '../src/users/DTO/createUser.dto';
import { UpdateUserDto } from '../src/users/DTO/updateUser.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockUserRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 2, ...user })),
    find: jest.fn(() => Promise.resolve([])),

    findOneBy: jest.fn((_id) => {
      const { id } = _id;
      if (id ===) {
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
  const _user = {
    id: 2,
    userName: 'Test',
    email: 'test@google.com',
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) - should create a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toEqual(testUser.userName);
    expect(response.body.email).toEqual(testUser.email);
  });

  it('/users (GET) -should get all user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });

  it('/users/:id (GET) - should get a user by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/2`)
      .expect(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.id).toBe('2');
    expect(response.body.name).toBe('Test');
    expect(response.body.email).toBe('test@google.com');
  });

  it('should return bad request if the user does not exist', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/34`)
      .expect(400);
    expect(response.body.message).toEqual('BadRequest');
  });

  it('/users/:id (PATCH) - should update a user', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/2`)
      .send(updateTestUser)
      .expect(200);

    expect(response.body).toHaveProperty('id', '2');
    expect(response.body.name).toBe(updateTestUser.userName);
    expect(response.body.email).toBe(updateTestUser.email);
  });

  it('should return BadRequest if the user does not exist', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/33`)
      .expect(400);

    expect(response.body.message).toEqual('BadRequest');
  });

  it('/users/:id (DELETE) - should delete a user', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/2`)
      .expect(200);

    expect(response.body).toHaveProperty('id', '2');
  });
  it('should return BadRequest if the user does not exist', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/33`)
      .expect(400);
    expect(response.body.message).toEqual('BadRequest');
  });
});
