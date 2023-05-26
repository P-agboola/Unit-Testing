import { IsNumber } from 'class-validator';

export class PaginationQueryDto {
  page?: number;

  pageSize?: number; // Default value of 10 items per page
}
