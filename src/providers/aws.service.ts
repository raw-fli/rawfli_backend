import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Image } from "src/models/tables/image.entity";
import { DecodedUserToken, User } from "src/models/tables/user.entity";
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

  async uploadImage(user: DecodedUserToken, file: Express.Multer.File) {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const key = `${Date.now()}-${originalName}`;
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      Body: file.buffer,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    const newImage = new Image();
    newImage.key = key;
    newImage.uploader = { id: user.id } as User;
    return await this.imageRepository.save(newImage);
  }
}