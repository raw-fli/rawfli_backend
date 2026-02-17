import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { JwtGuard } from "src/domain/auth/guards/jwt.guard";
import { UserDecorator } from "src/common/decorators/user.decorator";
import { Image } from "src/domain/aws/entity/image.entity";
import { DecodedUserToken } from "src/domain/user/entity/user.entity";
import { AwsService } from "src/domain/aws/aws.service";
import { createResponseForm, Try } from "src/common/types";

@Controller('api/v1/aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) { }

  @UseGuards(JwtGuard)
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UserDecorator() user: DecodedUserToken,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Try<Image>> {
    const imageEntity = await this.awsService.uploadImage(user, image);
    return createResponseForm(imageEntity);
  }
}