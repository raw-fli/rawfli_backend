import { Expose } from 'class-transformer';

export class DeletedCommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  originalCommentId: number;

  @Expose()
  postId: number;

  @Expose()
  boardId: number;

  @Expose()
  authorId: number;

  @Expose()
  content: string;

  @Expose()
  originalCreatedAt: Date;

  @Expose()
  deletedAt: Date;

  constructor(partial: Partial<DeletedCommentResponseDto>) {
    Object.assign(this, partial);
  }
}
