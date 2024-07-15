import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/providers/users.service';
import { JwtService } from '@nestjs/jwt';
import { TypedBody, TypedRoute } from '@nestia/core';
import { createResponseForm, Try, TryCatch } from 'src/types';
import { DecodedUserToken } from 'src/models/tables/user.entity';
import { EMAIL_ALREADY_CREATED } from 'src/config/errors/error';
import { isBusinessErrorGuard } from 'src/config/errors';
import { CreateUserDto } from 'src/models/dtos/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { LoginUserDto } from 'src/models/dtos/login-user.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  @TypedRoute.Post('signup')
  async signUp(
    @TypedBody() createUserDto: CreateUserDto
  ): Promise<TryCatch<DecodedUserToken, EMAIL_ALREADY_CREATED>> {
    const createUserResponse = await this.usersService.create(createUserDto);
    if (isBusinessErrorGuard(createUserResponse)) {
      return createUserResponse;
    }

    const { password, createdAt, ...user } = createUserResponse;
    return createResponseForm(user);
  }

  @UseGuards(LocalGuard)
  @TypedRoute.Post('login')
  login(@UserDecorator() user: DecodedUserToken, @TypedBody() body: LoginUserDto): Try<string> {
    const token = this.jwtService.sign({ ...user });
    return createResponseForm(token);
  }
}
