import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ArticleListItemResponseDto } from 'src/domain/article/dto/article.response.dto';

export class UserInfoResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty({ nullable: true })
  @Expose()
  profileImageKey?: string | null;

  @ApiProperty({ type: () => ArticleListItemResponseDto, isArray: true })
  @Expose()
  @Type(() => ArticleListItemResponseDto)
  articles: ArticleListItemResponseDto[];

  @ApiProperty()
  @Expose()
  followerCount: number;

  @ApiProperty()
  @Expose()
  followingCount: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserInfoResponseDto>) {
    Object.assign(this, partial);
  }
}
