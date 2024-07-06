import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  public email!: string;

  @IsString({ message: '닉네임을 입력해주세요.' })
  @MaxLength(21, { message: '닉네임은 21자 이하로 입력해주세요.' })
  public username!: string;

  @IsString({ message: '비밀번호를 입력해주세요.' })
  public password!: string;
}
