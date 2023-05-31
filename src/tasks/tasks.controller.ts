import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Patch, Query, UsePipes } from '@nestjs/common/decorators';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreatTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { updateTaskStatusDto } from './dto/update-task-status.dto';

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  private logger = new Logger('TasksController');
  constructor(private tasksService: TasksService) {}

  @ApiCreatedResponse({ description: 'Task created successfully' })
  @Post()
  @UsePipes(ValidationPipe)
  createTask(@Body() createTaskDto: CreatTaskDto): Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }

  @ApiOkResponse({ description: `Tasks found and return` })
  @Get()
  getTasks(
    @Query(ValidationPipe) filterDto: GetTaskFilterDto,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto);
  }

  @ApiOkResponse({ description: `Task found and return` })
  @ApiNotFoundResponse({ description: `Task id not found` })
  @Get(':id')
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @ApiOkResponse({ description: `Task found and deleted` })
  @ApiNotFoundResponse({ description: `Task id not found` })
  @Delete(':id')
  deleteTask(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.tasksService.deleteTask(id);
  }

  @ApiOkResponse({ description: `Task found and updated` })
  @ApiNotFoundResponse({ description: `Task id not found` })
  @ApiBody({ type: 'status', enum: TaskStatus })
  @Patch(':id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Promise<Task> {
    return this.tasksService.updateTask(id, status);
  }
}
