import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/domain/user/dto/user.response.dto';
import { CommentResponseDto } from 'src/domain/post/dto/comment.response.dto';

export class ReferencedPhotoDto {
  @Expose()
  id: string;

  @Expose()
  description?: string;

  @Expose()
  imageKey: string;
}

export class AttachedImageDto {
  @Expose()
  id: string;

  @Expose()
  key: string;
}

export class ArticleResponseDto {
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
  @Type(() => ReferencedPhotoDto)
  referencedPhotos: ReferencedPhotoDto[];

  @Expose()
  @Type(() => AttachedImageDto)
  attachedImages: AttachedImageDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ArticleResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ArticleListItemResponseDto {
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
  thumbnailKey: string | null;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<ArticleListItemResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ArticleListResponseDto {
  @Expose()
  @Type(() => ArticleListItemResponseDto)
  articles: ArticleListItemResponseDto[];

  @Expose()
  total: number;

  constructor(partial: Partial<ArticleListResponseDto>) {
    Object.assign(this, partial);
  }
}
