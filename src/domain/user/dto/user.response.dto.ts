import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @Exclude()
  email: string;

  @ApiProperty()
  @Expose()
  username: string;

  @Exclude()
  password: string;

  @ApiProperty({ nullable: true })
  @Expose()
  profileImageKey: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
