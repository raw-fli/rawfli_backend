import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeletedCommentResponseDto } from 'src/common/dtos/deleted-comment.response.dto';
import { DeletedPostResponseDto } from 'src/domain/post/dto/deleted-post.response.dto';
import { DeletedArticleResponseDto } from 'src/domain/article/dto/deleted-article.response.dto';
import { ExifData } from 'src/common/utils/exif.utils';

export class AdminImageResponseDto {
  @ApiProperty({ example: '018f0cd9-e6df-7dc0-b56d-06f8a8786986' })
  @Expose()
  id: string;

  @ApiProperty({ example: '1734055772762-sample.jpg' })
  @Expose()
  key: string;

  @ApiProperty({ nullable: true, required: false, type: 'object' })
  @Expose()
  exifData: ExifData | null;

  @ApiProperty({ example: 12 })
  @Expose()
  uploaderId: number;

  @ApiProperty({ example: 'rawfli-user' })
  @Expose()
  uploaderUsername: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

export class AdminImageListResponseDto {
  @ApiProperty({ type: () => [AdminImageResponseDto] })
  @Expose()
  @Type(() => AdminImageResponseDto)
  images: AdminImageResponseDto[];

  @ApiProperty({ example: 120 })
  @Expose()
  total: number;
}

export class AdminDeletedPostListResponseDto {
  @ApiProperty({ type: () => [DeletedPostResponseDto] })
  @Expose()
  @Type(() => DeletedPostResponseDto)
  posts: DeletedPostResponseDto[];

  @ApiProperty({ example: 40 })
  @Expose()
  total: number;
}

export class AdminDeletedArticleListResponseDto {
  @ApiProperty({ type: () => [DeletedArticleResponseDto] })
  @Expose()
  @Type(() => DeletedArticleResponseDto)
  articles: DeletedArticleResponseDto[];

  @ApiProperty({ example: 40 })
  @Expose()
  total: number;
}

export class AdminDeletedCommentListResponseDto {
  @ApiProperty({ type: () => [DeletedCommentResponseDto] })
  @Expose()
  @Type(() => DeletedCommentResponseDto)
  comments: DeletedCommentResponseDto[];

  @ApiProperty({ example: 180 })
  @Expose()
  total: number;
}
