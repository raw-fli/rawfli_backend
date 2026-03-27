import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { Image } from "src/domain/aws/entity/image.entity";
import { MyImageListResponseDto } from "src/domain/aws/dto/my-image.response.dto";
import { DecodedUserToken, User } from "src/domain/user/entity/user.entity";
import { parseExifFromBuffer } from "src/common/utils/exif.utils";
import { Repository } from "typeorm";

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadImages(user: DecodedUserToken, files: Express.Multer.File[]) {
    const uploads = files.map(async (file) => {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const key = `${Date.now()}-${originalName}`;
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);
      const exifData = await parseExifFromBuffer(file.buffer);
      const newImage = new Image();
      newImage.key = key;
      newImage.uploader = { id: user.id } as User;
      newImage.exifData = exifData;
      return await this.imageRepository.save(newImage);
    });

    return await Promise.all(uploads);
  }

  async getMyImages(
    user: DecodedUserToken,
    page: number = 1,
    limit: number = 40,
  ): Promise<MyImageListResponseDto> {
    const [images, total] = await this.imageRepository.findAndCount({
      where: { uploader: { id: user.id } },
      relations: ['photos'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = images.map((image) => ({
      id: image.id,
      key: image.key,
      createdAt: image.createdAt,
      cameraMake: image.exifData?.cameraMake ?? null,
      cameraModel: image.exifData?.cameraModel ?? null,
      lensMake: image.exifData?.lensMake ?? null,
      lensModel: image.exifData?.lensModel ?? null,
      iso: image.exifData?.iso ?? null,
      aperture: image.exifData?.aperture ?? null,
      shutterSpeedDisplay: image.exifData?.shutterSpeedDisplay ?? null,
      shutterSpeedValue: image.exifData?.shutterSpeedValue ?? null,
      focalLength: image.exifData?.focalLength ?? null,
      usedInPhotoCount: image.photos?.length ?? 0,
    }));

    return plainToInstance(
      MyImageListResponseDto,
      { images: items, total },
      { excludeExtraneousValues: true },
    );
  }
}