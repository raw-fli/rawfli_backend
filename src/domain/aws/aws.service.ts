import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Image } from "src/domain/aws/entity/image.entity";
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

  async getImages() {
    return await this.imageRepository.find({
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
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
}