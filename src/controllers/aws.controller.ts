import { TypedRoute } from "@nestia/core";
import { Controller, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { AwsService } from "src/providers/aws.service";

@Controller('api/v1/aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) { }

  @UseGuards(JwtGuard)
  @ApiConsumes('multipart/form-data')
  @TypedRoute.Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() image: Express.Multer.File
  ): Promise<string> {
    return await this.awsService.uploadImage(image);
  }
}