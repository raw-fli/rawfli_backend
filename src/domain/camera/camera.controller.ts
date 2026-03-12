import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { CameraListResponseDto } from 'src/domain/camera/dto/camera.response.dto';
import { CamerasService } from 'src/domain/camera/camera.service';
import { createResponseForm, Try } from 'src/common/types';

@ApiTags('cameras')
@Controller('api/v1/cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) { }

  @ApiOperation({ summary: '카메라 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(CameraListResponseDto) })
  @Get()
  async getCameras(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<CameraListResponseDto>> {
    const result = await this.camerasService.getCameras(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }
}
