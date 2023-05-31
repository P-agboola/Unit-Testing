import { IsNotEmpty, IsString } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class updateTaskStatusDto {
  @IsString()
  @IsNotEmpty()
  status: TaskStatus;
}
