import { Expose } from 'class-transformer';

export class DeletedArticleResponseDto {
  @Expose()
  id: number;

  @Expose()
  originalArticleId: number;

  @Expose()
  boardId: number;

  @Expose()
  authorId: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  views: number;

  @Expose()
  originalCreatedAt: Date;

  @Expose()
  deletedAt: Date;

  constructor(partial: Partial<DeletedArticleResponseDto>) {
    Object.assign(this, partial);
  }
}
