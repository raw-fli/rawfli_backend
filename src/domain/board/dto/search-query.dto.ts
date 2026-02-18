import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum SearchIn {
  TITLE = 'title',
  CONTENT = 'content',
  BOTH = 'both',
}

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  keyword!: string;

  @IsOptional()
  @IsEnum(SearchIn)
  searchIn: SearchIn = SearchIn.BOTH;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 20;
}