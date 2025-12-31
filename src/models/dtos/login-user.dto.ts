import { IsString } from "class-validator";

export class LoginUserDto {
  @IsString({
    message: "이메일을 입력해주세요."
  })
  email: string;

  @IsString({
    message: "비밀번호를 입력해주세요."
  })
  password: string;
}