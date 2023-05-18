import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TestUser, Users } from './entities/user.entity';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'USER',
      useValue: process.env.NODE_ENV === 'development' ? Users : TestUser,
    },
  ],
})
export class UsersModule {}
