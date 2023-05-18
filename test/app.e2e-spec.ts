import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUsersDto } from '../src/users/DTO/createUser.dto';
import { UpdateUserDto } from '../src/users/DTO/updateUser.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testUser: CreateUsersDto = {
    name: 'Test',
    email: 'test@google.com',
  };
  const updateTestUser: UpdateUserDto = {
    name: 'Test Example',
    email: 'testExample@google.com',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    expect(response.body.name).toEqual(testUser.name);
    expect(response.body.email).toEqual(testUser.email);
  });

  it('/users (GET) -should get all user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);
    expect(response.body[0]).toHaveProperty('id', '2');
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
    expect(response.body.name).toBe(updateTestUser.name);
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
