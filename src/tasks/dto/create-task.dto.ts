import { IsNotEmpty, IsString } from 'class-validator';

export class CreatTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  userId: number;
}
