import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { User } from '../users/entities/user.entity';
import { updateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createTask(createTaskDto: CreatTaskDto): Promise<Task> {
    const user = await this.userRepository.findOneBy({
      id: createTaskDto.userId,
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const task = await this.taskRepository.create({
      ...createTaskDto,
      userId: user.id,
    });
    task.user = user;
    task.status = TaskStatus.OPEN;
    return await this.taskRepository.save(task);
  }

  async getTasks(filterDto: GetTaskFilterDto): Promise<Task[]> {
    const { status, search, userId } = filterDto;
    const query = this.taskRepository.createQueryBuilder('task');
    query.andWhere('task.userId = :userId', { userId });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    try {
      const task = await query.getMany();
      return task;
    } catch (error) {
      throw new Error(error.stack || error);
    }
  }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id },
    });
    if (!found) {
      throw new NotFoundException(`task with ID "${id}" not found`);
    }
    return found;
  }

  async deleteTask(id: number): Promise<string> {
    const result = await this.taskRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`task with ID "${id}" not found`);
    }
    return `task with ID "${id}" deleted`;
  }

  async updateTask(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new NotFoundException(`task with ID "${id}" not found`);
    }
    task.status = status;
    await task.save();
    return task;
  }
}
