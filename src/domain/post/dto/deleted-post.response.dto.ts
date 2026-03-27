import { Expose } from 'class-transformer';

export class DeletedPostResponseDto {
  @Expose()
  id: number;

  @Expose()
  originalPostId: number;

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

  constructor(partial: Partial<DeletedPostResponseDto>) {
    Object.assign(this, partial);
  }
}
