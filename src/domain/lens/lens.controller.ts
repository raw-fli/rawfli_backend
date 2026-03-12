import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dtos/api-response.dto';
import { LensListResponseDto } from 'src/domain/lens/dto/lens.response.dto';
import { LensesService } from 'src/domain/lens/lens.service';
import { createResponseForm, Try } from 'src/common/types';

@ApiTags('lenses')
@Controller('api/v1/lenses')
export class LensesController {
  constructor(private readonly lensesService: LensesService) { }

  @ApiOperation({ summary: '렌즈 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(LensListResponseDto) })
  @Get()
  async getLenses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Try<LensListResponseDto>> {
    const result = await this.lensesService.getLenses(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return createResponseForm(result);
  }
}
