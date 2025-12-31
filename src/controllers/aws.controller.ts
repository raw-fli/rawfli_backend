import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { UserDecorator } from "src/common/decorators/user.decorator";
import { Photo } from "src/models/tables/photo.entity";
import { DecodedUserToken } from "src/models/tables/user.entity";
import { AwsService } from "src/providers/aws.service";
import { createResponseForm, Try } from "src/types";

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
  ): Promise<Try<Photo>> {
    const photo = await this.awsService.uploadImage(user, image);
    return createResponseForm(photo);
  }
}