import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/providers/users.service';
import { JwtService } from '@nestjs/jwt';
import { TypedBody, TypedRoute } from '@nestia/core';
import { CreateUserDto } from 'src/models/dtos/create-user.dto';
import { createResponseForm, TryCatch } from 'src/types';
import { DecodedUserToken } from 'src/models/tables/user.entity';
import { ALREADY_CREATED_EMAIL } from 'src/config/errors/error';
import { isBusinessErrorGuard } from 'src/config/errors';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @TypedRoute.Post('signup')
  async signUp(
    @TypedBody() createUserDto: CreateUserDto,
  ): Promise<TryCatch<DecodedUserToken, ALREADY_CREATED_EMAIL>> {
    const createUserResponse = await this.usersService.create(createUserDto);
    if (isBusinessErrorGuard(createUserResponse)) {
      return createUserResponse;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, ...user } = createUserResponse;
    return createResponseForm(user);
  }
}
