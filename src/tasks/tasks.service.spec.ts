import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreatTaskDto } from './dto/create-task.dto';
import { updateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../users/entities/user.entity';
import { TasksService } from './tasks.service';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';

describe('TaskService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createTask', () => {
    const createTaskDto: CreatTaskDto = {
      title: 'Task 1',
      description: 'Task description',
      userId: 1,
    };

    it('should create a new task', async () => {
      const user = new User();
      user.id = 1;
      userRepository.findOneBy = jest
        .fn()
        .mockResolvedValue({ id: createTaskDto.userId });
      taskRepository.create = jest.fn().mockReturnValue({
        id: 1,
        ...createTaskDto,
        status: TaskStatus.OPEN,
        user: user,
      });
      taskRepository.save = jest.fn().mockResolvedValue({
        id: 1,
        ...createTaskDto,
        status: TaskStatus.OPEN,
        user: user,
      });

      const result = await service.createTask(createTaskDto);

      await expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: createTaskDto.userId,
      });
      await expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
      });
      await expect(taskRepository.save).toHaveBeenCalledWith({
        id: 1,
        ...createTaskDto,
        status: TaskStatus.OPEN,
        user: user,
      });
      expect(result).toEqual({
        id: 1,
        ...createTaskDto,
        status: TaskStatus.OPEN,
        user: user,
      });
    });
    it('should throw NotFoundException when the user does not exist', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.createTask(createTaskDto)).rejects.toThrowError(
        NotFoundException,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: createTaskDto.userId,
      });
    });
  });

  describe('getTaskById', () => {
    const taskId = 1;

    it('should return the task with the given ID', async () => {
      const task = new Task();
      task.id = taskId;

      taskRepository.findOne = jest.fn().mockResolvedValue(task);

      const result = await service.getTaskById(taskId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      taskRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getTaskById(taskId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });

  describe('getTasks', () => {
    it('should return tasks based on the filter', async () => {
      const filterDto: GetTaskFilterDto = {
        status: TaskStatus.OPEN,
        search: 'keyword',
        userId: 1,
      };
      const user: User = {
        id: 1,
        userName: 'johndoe',
        email: 'johndoe@example.com',
        profile: null,
        tasks: [],
        hasId: () => true,
        save: () => Promise.resolve(user),
        remove: () => Promise.resolve(user),
        softRemove: () => Promise.resolve(user),
        recover: () => Promise.resolve(user),
        reload: () => Promise.resolve(),
      };

      const tasks: Task[] = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Task description',
          status: TaskStatus.OPEN,
          userId: 1,
          user: user,
          hasId: () => true,
          save: () => Promise.resolve(tasks[0]),
          remove: () => Promise.resolve(tasks[0]),
          softRemove: () => Promise.resolve(tasks[0]),
          recover: () => Promise.resolve(tasks[0]),
          reload: () => Promise.resolve(),
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Task description',
          status: TaskStatus.IN_PROGRESS,
          userId: 1,
          user: user,
          hasId: () => true,
          save: () => Promise.resolve(tasks[1]),
          remove: () => Promise.resolve(tasks[1]),
          softRemove: () => Promise.resolve(tasks[1]),
          recover: () => Promise.resolve(tasks[1]),
          reload: () => Promise.resolve(),
        },
      ];

      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks),
      };

      taskRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilderMock);

      const result = await service.getTasks(filterDto);

      expect(taskRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'task.userId = :userId',
        { userId: filterDto.userId },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: filterDto.status },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${filterDto.search}%` },
      );
      expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(tasks);
    });
  });

  describe('updateTaskStatus', () => {
    const user: User = {
      id: 1,
      userName: 'johndoe',
      email: 'johndoe@example.com',
      profile: null,
      tasks: [],
      hasId: () => true,
      save: () => Promise.resolve(user),
      remove: () => Promise.resolve(user),
      softRemove: () => Promise.resolve(user),
      recover: () => Promise.resolve(user),
      reload: () => Promise.resolve(),
    };
    const task: Task = {
      id: 1,
      title: 'Task 1',
      description: 'Task description',
      status: TaskStatus.OPEN,
      userId: 1,
      user: user,
      hasId: () => true,
      save: () => Promise.resolve(task),
      remove: () => Promise.resolve(task),
      softRemove: () => Promise.resolve(task),
      recover: () => Promise.resolve(task),
      reload: () => Promise.resolve(),
    };

    it('should update the status of a task', async () => {
      taskRepository.findOneBy = jest.fn().mockResolvedValue(task);
      taskRepository.save = jest.fn().mockResolvedValue({
        ...task,
        status: TaskStatus.IN_PROGRESS,
      });
      const result = await service.updateTask(task.id, TaskStatus.IN_PROGRESS);
      expect(taskRepository.findOneBy).toHaveBeenCalledWith({
        id: task.id,
      });

      expect(result).toEqual({ ...task, status: TaskStatus.IN_PROGRESS });
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      taskRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateTask(task.id, TaskStatus.IN_PROGRESS),
      ).rejects.toThrowError(NotFoundException);
      expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: task.id });
    });
  });

  describe('deleteTask', () => {
    const taskId = 1;

    it('should delete the task with the given ID', async () => {
      const task = new Task();
      task.id = taskId;
      taskRepository.delete = jest.fn().mockResolvedValue('Task deleted');

      const result = await service.deleteTask(taskId);
      await expect(taskRepository.delete).toHaveBeenCalledWith({ id: taskId });
      expect(result).toBe('Task deleted');
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      taskRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });

      await expect(service.deleteTask(taskId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: taskId });
    });
  });
});
