import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MeResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty({ nullable: true })
  @Expose()
  profileImageKey: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  bio: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
