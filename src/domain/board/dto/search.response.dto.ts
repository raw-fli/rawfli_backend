import { Expose, Type } from 'class-transformer';

export class SearchAuthorResponseDto {
  @Expose()
  id!: number;

  @Expose()
  username!: string;
}

export class SearchResultItemResponseDto {
  @Expose()
  type!: 'post' | 'article';

  @Expose()
  id!: number;

  @Expose()
  boardId!: number;

  @Expose()
  boardName!: string;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose()
  @Type(() => SearchAuthorResponseDto)
  author!: SearchAuthorResponseDto;

  @Expose()
  views!: number;

  @Expose()
  likesCount!: number;

  @Expose()
  commentCount!: number;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<SearchResultItemResponseDto>) {
    Object.assign(this, partial);
  }
}

export class SearchResultsResponseDto {
  @Expose()
  @Type(() => SearchResultItemResponseDto)
  results!: SearchResultItemResponseDto[];

  @Expose()
  total!: number;

  constructor(partial: Partial<SearchResultsResponseDto>) {
    Object.assign(this, partial);
  }
}