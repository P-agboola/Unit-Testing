import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  occupation?: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
