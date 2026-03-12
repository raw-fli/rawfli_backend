import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/domain/auth/guards/jwt.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { DecodedUserToken } from 'src/domain/user/entity/user.entity';
import { createResponseForm, Try } from 'src/common/types';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { MeResponseDto } from './dto/me.response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MeService } from './me.service';

@ApiTags('me')
@UseGuards(JwtGuard)
@Controller('api/v1/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiOkResponse({ type: ApiResponse(MeResponseDto) })
  @Get()
  async getMe(
    @UserDecorator() user: DecodedUserToken,
  ): Promise<Try<MeResponseDto>> {
    const me = await this.meService.getMe(user.id);
    return createResponseForm(me);
  }

  @ApiOperation({ summary: '프로필 수정' })
  @ApiOkResponse({ type: ApiResponse(MeResponseDto) })
  @Patch('profile')
  async updateProfile(
    @UserDecorator() user: DecodedUserToken,
    @Body() dto: UpdateProfileDto,
  ): Promise<Try<MeResponseDto>> {
    const updated = await this.meService.updateProfile(user.id, dto);
    return createResponseForm(updated);
  }

  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiOkResponse()
  @Patch('password')
  async updatePassword(
    @UserDecorator() user: DecodedUserToken,
    @Body() dto: UpdatePasswordDto,
  ): Promise<Try<null>> {
    await this.meService.updatePassword(user.id, dto);
    return createResponseForm(null);
  }
}
