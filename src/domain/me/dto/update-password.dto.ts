import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ description: '현재 비밀번호' })
  @IsString({ message: '현재 비밀번호를 입력해주세요.' })
  currentPassword: string;

  @ApiProperty({ description: '새 비밀번호' })
  @IsString({ message: '새 비밀번호를 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 6자리 이상이어야 합니다.' })
  newPassword: string;
}
