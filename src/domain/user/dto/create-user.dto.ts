import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일을 입력해주세요." })
  email: string;

  @IsString({ message: "닉네임을 입력해주세요." })
  @IsNotEmpty({ message: "닉네임을 입력해주세요." })
  @Matches(/^[a-zA-Z0-9가-힣]+$/, {
    message: "닉네임은 한글, 영문, 숫자만 사용할 수 있으며 공백이나 이모지는 허용되지 않습니다.",
  })
  username: string;

  @IsString({ message: "비밀번호를 입력해주세요." })
  @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
  @MinLength(6, { message: "비밀번호는 6자리 이상이어야 합니다." })
  password: string;
}
