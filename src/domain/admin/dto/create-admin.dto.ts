import { IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string;
}
