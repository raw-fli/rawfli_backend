import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from 'src/domain/admin/admin.service';
import { AdminGuard } from 'src/domain/admin/guards/admin.guard';
import { AdminLocalGuard } from 'src/domain/admin/guards/admin-local.guard';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { DecodedAdminToken } from 'src/domain/admin/entity/admin.entity';
import { CreateAdminDto } from 'src/domain/admin/dto/create-admin.dto';
import { LoginAdminDto } from 'src/domain/admin/dto/login-admin.dto';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { MergeEquipmentDto } from 'src/common/dtos/merge-equipment.dto';
import { CameraListResponseDto, CameraResponseDto } from 'src/domain/camera/dto/camera.response.dto';
import { LensListResponseDto, LensResponseDto } from 'src/domain/lens/dto/lens.response.dto';
import { CamerasService } from 'src/domain/camera/camera.service';
import { LensesService } from 'src/domain/lens/lens.service';
import { createResponseForm, Try } from 'src/common/types';

class AdminTokenDto {
  @ApiProperty({ type: String, description: '관리자 JWT 토큰' })
  token: string;
}

class AdminInfoDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
}

@ApiTags('admin')
@Controller('api/v1/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly camerasService: CamerasService,
    private readonly lensesService: LensesService,
  ) { }

  @ApiOperation({ summary: '관리자 계정 생성' })
  @ApiCreatedResponse({ type: ApiResponse(AdminInfoDto) })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('signup')
  async createAdmin(
    @Body() dto: CreateAdminDto,
  ): Promise<Try<DecodedAdminToken>> {
    const admin = await this.adminService.createAdmin(dto);
    return createResponseForm(admin);
  }

  @ApiOperation({ summary: '관리자 로그인' })
  @ApiCreatedResponse({ type: ApiResponse(AdminTokenDto) })
  @UseGuards(AdminLocalGuard)
  @Post('login')
  login(
    @UserDecorator() admin: DecodedAdminToken,
    @Body() body: LoginAdminDto,
  ): Try<{ token: string }> {
    const token = this.adminService.adminLogin(admin);
    return createResponseForm({ token });
  }

  @ApiOperation({ summary: '미검증 카메라 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(CameraListResponseDto) })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('cameras/unverified')
  async getUnverifiedCameras(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<CameraListResponseDto>> {
    const result = await this.camerasService.getUnverifiedCameras(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '카메라 병합' })
  @ApiOkResponse({ type: ApiResponse(CameraResponseDto) })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('cameras/merge')
  async mergeCameras(
    @Body() dto: MergeEquipmentDto,
  ): Promise<Try<CameraResponseDto>> {
    const result = await this.camerasService.mergeCameras(dto.targetId, dto.sourceIds);
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '미검증 렌즈 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(LensListResponseDto) })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('lenses/unverified')
  async getUnverifiedLenses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<LensListResponseDto>> {
    const result = await this.lensesService.getUnverifiedLenses(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '렌즈 병합' })
  @ApiOkResponse({ type: ApiResponse(LensResponseDto) })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('lenses/merge')
  async mergeLenses(
    @Body() dto: MergeEquipmentDto,
  ): Promise<Try<LensResponseDto>> {
    const result = await this.lensesService.mergeLenses(dto.targetId, dto.sourceIds);
    return createResponseForm(result);
  }
}
