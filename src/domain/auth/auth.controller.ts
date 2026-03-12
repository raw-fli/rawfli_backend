import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/domain/user/user.service';
import { createResponseForm, ERROR, Try, TryCatch } from 'src/common/types';
import { DecodedUserToken } from 'src/domain/user/entity/user.entity';
import { CreateUserDto } from 'src/domain/user/dto/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { LoginUserDto } from 'src/domain/user/dto/login-user.dto';
import { ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { UserResponseDto } from 'src/domain/user/dto/user.response.dto';

class TokenDto {
  @ApiProperty({ type: String, description: 'JWT 토큰' })
  token: string;
}

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ type: ApiResponse(UserResponseDto) })
  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto
  ): Promise<TryCatch<DecodedUserToken, ERROR>> {
    const createUserResponse = await this.usersService.create(createUserDto);

    const { password, createdAt, ...user } = createUserResponse;
    return createResponseForm(user);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiCreatedResponse({ type: ApiResponse(TokenDto) })
  @UseGuards(LocalGuard)
  @Post('login')
  login(@UserDecorator() user: DecodedUserToken, @Body() body: LoginUserDto): Try<{ token: string }> {
    const token = this.authService.userLogin(user);
    return createResponseForm({ token });
  }
}
