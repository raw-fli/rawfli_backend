import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MaxLength(21)
  public username!: string;

  @IsString()
  @MinLength(8)
  public password!: string;
}
