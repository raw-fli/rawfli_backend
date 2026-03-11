import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './user.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfoResponseDto } from './dto/user-info.response.dto';
import { createResponseForm, Try } from 'src/common/types';

@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: '유저 조회' })
  @ApiOkResponse({ type: UserInfoResponseDto })
  @Get(':userId')
  async getUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Try<UserInfoResponseDto>> {
    const user = await this.usersService.getUserInfo(userId);
    return createResponseForm(user);
  }
}
