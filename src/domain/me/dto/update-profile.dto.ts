import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '닉네임' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 키' })
  @IsOptional()
  @IsString()
  profileImageKey?: string | null;

  @ApiPropertyOptional({ description: '자기소개' })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: '자기소개는 300자 이내로 입력해주세요.' })
  bio?: string | null;
}
