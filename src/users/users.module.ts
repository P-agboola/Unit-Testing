import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/task.entity';
import { Profile } from '../profiles/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Profile])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
