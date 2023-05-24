import { IsNumber } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  page: number;

  @IsNumber()
  pageSize?: number; // Default value of 10 items per page
}
