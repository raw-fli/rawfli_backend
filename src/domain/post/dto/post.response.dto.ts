import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/domain/user/dto/user.response.dto';
import { CommentResponseDto } from './comment.response.dto';

export class PostResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserResponseDto)
  author: UserResponseDto;

  @Expose()
  views: number;

  @Expose()
  likesCount: number;

  @Expose()
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PostListItemResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  @Type(() => UserResponseDto)
  author: UserResponseDto;

  @Expose()
  views: number;

  @Expose()
  commentCount: number;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<PostListItemResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PostListResponseDto {
  @Expose()
  @Type(() => PostListItemResponseDto)
  posts: PostListItemResponseDto[];

  @Expose()
  total: number;

  constructor(partial: Partial<PostListResponseDto>) {
    Object.assign(this, partial);
  }
}
