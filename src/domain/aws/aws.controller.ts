import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/domain/auth/guards/jwt.guard";
import { UserDecorator } from "src/common/decorators/user.decorator";
import { Image } from "src/domain/aws/entity/image.entity";
import { DecodedUserToken } from "src/domain/user/entity/user.entity";
import { AwsService } from "src/domain/aws/aws.service";
import { createResponseForm, Try } from "src/common/types";

@ApiTags('aws')
@Controller('api/v1/aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) { }

  @ApiOperation({ summary: '이미지 업로드' })
  @ApiOkResponse({ type: Image, isArray: true })
  @UseGuards(JwtGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFile(
    @UserDecorator() user: DecodedUserToken,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<Try<Image[]>> {
    const imageEntities = await this.awsService.uploadImages(user, images);
    return createResponseForm(imageEntities);
  }
}