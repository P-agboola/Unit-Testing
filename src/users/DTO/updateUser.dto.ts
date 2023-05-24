import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  userName?: string;

  @IsString()
  @IsNotEmpty()
  email?: string;
}
