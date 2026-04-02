import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/domain/auth/guards/jwt.guard";
import { UserDecorator } from "src/common/decorators/user.decorator";
import { DecodedUserToken } from "src/domain/user/entity/user.entity";
import { AwsService } from "src/domain/aws/aws.service";
import { createResponseForm, Try } from "src/common/types";
import { MyImageQueryDto } from "src/domain/aws/dto/my-image-query.dto";
import { MyImageListResponseDto } from "src/domain/aws/dto/my-image.response.dto";
import { ApiResponse } from "src/common/dtos/api-response.dto";
import { CreatePresignedUploadUrlDto } from "src/domain/aws/dto/create-presigned-upload-url.dto";
import { PresignedUploadUrlResponseDto } from "src/domain/aws/dto/presigned-upload-url.response.dto";

@ApiTags('aws')
@Controller('api/v1/aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) { }

  @ApiOperation({ summary: '내 업로드 이미지 목록 조회' })
  @ApiOkResponse({ type: ApiResponse(MyImageListResponseDto) })
  @UseGuards(JwtGuard)
  @Get('images/me')
  async getMyImages(
    @UserDecorator() user: DecodedUserToken,
    @Query() query: MyImageQueryDto,
  ): Promise<Try<MyImageListResponseDto>> {
    const result = await this.awsService.getMyImages(
      user,
      query.page,
      query.limit,
    );
    return createResponseForm(result);
  }

  @ApiOperation({ summary: '이미지 업로드용 presigned URL 발급' })
  @ApiOkResponse({ type: ApiResponse(PresignedUploadUrlResponseDto) })
  @UseGuards(JwtGuard)
  @Post('upload/presigned-urls')
  async createUploadPresignedUrls(
    @UserDecorator() user: DecodedUserToken,
    @Body() dto: CreatePresignedUploadUrlDto,
  ): Promise<Try<PresignedUploadUrlResponseDto>> {
    const result = await this.awsService.createPresignedUploadUrls(user, dto);
    return createResponseForm(result);
  }
}