import { Expose, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from 'src/domain/user/dto/user.response.dto';
import { PhotoResponseDto } from 'src/common/dtos/photo.response.dto';

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
  @ApiPropertyOptional({ type: () => [PhotoResponseDto] })
  @Type(() => PhotoResponseDto)
  photos: PhotoResponseDto[];

  @Expose()
  createdAt: Date;

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
