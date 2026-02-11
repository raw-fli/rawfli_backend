import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/providers/users.service';
import { createResponseForm, ERROR, Try, TryCatch } from 'src/types';
import { DecodedUserToken } from 'src/models/tables/user.entity';
import { CreateUserDto } from 'src/models/dtos/request/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { LoginUserDto } from 'src/models/dtos/request/login-user.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto
  ): Promise<TryCatch<DecodedUserToken, ERROR>> {
    const createUserResponse = await this.usersService.create(createUserDto);

    const { password, createdAt, ...user } = createUserResponse;
    return createResponseForm(user);
  }

  @UseGuards(LocalGuard)
  @Post('login')
  login(@UserDecorator() user: DecodedUserToken, @Body() body: LoginUserDto): Try<string> {
    const token = this.authService.userLogin(user);
    return createResponseForm(token);
  }
}
