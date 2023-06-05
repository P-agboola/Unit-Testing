import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { TaskStatus } from './task-status.enum';

describe('TasksController', () => {
  let controller: TasksController;
  const createTaskDto = {
    title: 'Test Task',
    description: 'This is a test task',
    userId: 1,
  };
  const user: User = {
    id: 1,
    userName: 'johndoe',
    email: 'johndoe@example.com',
    profile: null,
    tasks: [],
    hasId: () => true, // Assuming these methods exist in the User entity
    save: () => Promise.resolve(user),
    remove: () => Promise.resolve(user),
    softRemove: () => Promise.resolve(user),
    recover: () => Promise.resolve(user),
    reload: () => Promise.resolve(),
  };
  const task = {
    id: 1,
    ...createTaskDto,
    status: TaskStatus.OPEN,
    user: user,
    userId: createTaskDto.userId,
  };
  const mockUserRepository = {
    findOneBy: jest.fn(async (query) => {
      if (query.id === user.id) {
        return await Promise.resolve(user);
      }
      throw new NotFoundException(`Task with ID "${query.id}" not found`);
    }),
  };
  const mockTasksService = {
    createTask: jest.fn(async (createTask) => {
      await Promise.resolve(
        mockUserRepository.findOneBy({ id: createTaskDto.userId }),
      );
      return Promise.resolve({
        id: 1,
        ...createTask,
        status: 'OPEN',
        user: user,
        userId: createTask.userId,
      });
    }),

    getTasks: jest.fn(() => {
      return Promise.resolve([task]);
    }),

    getTaskById: jest.fn(async (id: number) => {
      if (id === task.id) {
        return await Promise.resolve(task);
      }
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }),

    deleteTask: jest.fn(async (id: number) => {
      if (id === task.id) {
        return await Promise.resolve(`Task with ID "${id}" deleted`);
      }
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }),

    updateTask: jest.fn(async (id: number, status: TaskStatus) => {
      if (id === task.id) {
        return await Promise.resolve({ id: task.id, ...task, status });
      }
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    })
      .overrideProvider(TasksService)
      .useValue(mockTasksService)
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task', async () => {
    const createdTask = await controller.createTask(createTaskDto);
    expect(createdTask).toEqual({
      id: 1,
      ...createTaskDto,
      status: 'OPEN',
      user: user,
      userId: createTaskDto.userId,
    });
    expect(mockTasksService.createTask).toHaveBeenCalledWith(createTaskDto);
  });

  it('should get all tasks', async () => {
    const filterDto = { status: TaskStatus.OPEN, search: 'test', userId: 1 };
    const allTasks = await controller.getTasks(filterDto);
    expect(allTasks).toEqual([task]);
    expect(mockTasksService.getTasks).toHaveBeenCalledWith(filterDto);
  });

  it('should get a task by id', async () => {
    const retrievedTask = await controller.getTaskById(1);
    expect(retrievedTask).toEqual(task);
    expect(mockTasksService.getTaskById).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when task by id does not exits', async () => {
    await expect(controller.getTaskById(2)).rejects.toThrowError(
      NotFoundException,
    );
    expect(mockTasksService.getTaskById).toHaveBeenCalledWith(2);
  });

  it('should delete a task', async () => {
    const result = await controller.deleteTask(1);
    expect(result).toBe(`Task with ID "1" deleted`);
    expect(mockTasksService.deleteTask).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundExceptionwhen when task by id does not exits', async () => {
    await expect(controller.deleteTask(2)).rejects.toThrowError(
      NotFoundException,
    );
    expect(mockTasksService.deleteTask).toHaveBeenCalledWith(2);
  });

  it('should update the status of a task', async () => {
    const updatedTask = await controller.updateTaskStatus(
      1,
      TaskStatus.IN_PROGRESS,
    );
    expect(updatedTask).toEqual({
      id: 1,
      ...task,
      status: TaskStatus.IN_PROGRESS,
    });
    expect(mockTasksService.updateTask).toHaveBeenCalledWith(
      1,
      TaskStatus.IN_PROGRESS,
    );
  });

  it('should throw NotFoundExceptionwhen task by id does not exits', async () => {
    await expect(
      controller.updateTaskStatus(2, TaskStatus.IN_PROGRESS),
    ).rejects.toThrowError(NotFoundException);
    expect(mockTasksService.updateTask).toHaveBeenCalledWith(
      2,
      TaskStatus.IN_PROGRESS,
    );
  });
});
