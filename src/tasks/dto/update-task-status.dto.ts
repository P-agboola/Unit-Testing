import { IsIn } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class updateTaskStatusDto {
  @IsIn([TaskStatus.IN_PROGRESS, TaskStatus.DONE])
  status: TaskStatus;
}
