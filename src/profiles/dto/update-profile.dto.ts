import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  occupation?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;
}
