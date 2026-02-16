import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from './user.response.dto';

export class CommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserResponseDto)
  author: UserResponseDto;

  @Expose()
  @Type(() => CommentResponseDto)
  replies: CommentResponseDto[];

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<CommentResponseDto>) {
    Object.assign(this, partial);
  }
}
