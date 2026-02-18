import { IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString({
    message: "이메일을 입력해주세요."
  })
  email: string;

  @IsString({
    message: "닉네임을 입력해주세요."
  })
  username: string;

  @IsString({
    message: "비밀번호를 입력해주세요."
  })
  @MinLength(6, {
    message: "비밀번호는 6자리 이상이어야 합니다."
  })
  password: string;
}
