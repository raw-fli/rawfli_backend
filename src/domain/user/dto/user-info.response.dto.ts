import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PostResponseDto } from 'src/domain/post/dto/post.response.dto';

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

  @ApiProperty({ type: () => PostResponseDto, isArray: true })
  @Expose()
  @Type(() => PostResponseDto)
  posts: PostResponseDto[];

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
