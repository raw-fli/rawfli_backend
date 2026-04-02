import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { Image } from "src/domain/aws/entity/image.entity";
import { CreatePresignedUploadUrlDto } from 'src/domain/aws/dto/create-presigned-upload-url.dto';
import { MyImageListResponseDto } from "src/domain/aws/dto/my-image.response.dto";
import { PresignedUploadUrlResponseDto } from 'src/domain/aws/dto/presigned-upload-url.response.dto';
import { DecodedUserToken, User } from "src/domain/user/entity/user.entity";
import { Repository } from "typeorm";
import { v7 as uuidv7 } from 'uuid';

const PRESIGNED_URL_EXPIRES_IN_SECONDS = 300;
const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'image/x-canon-cr2',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-adobe-dng',
  'image/x-fuji-raf',
]);

const CONTENT_TYPE_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/tiff': 'tif',
  'image/bmp': 'bmp',
  'image/x-canon-cr2': 'cr2',
  'image/x-nikon-nef': 'nef',
  'image/x-sony-arw': 'arw',
  'image/x-adobe-dng': 'dng',
  'image/x-fuji-raf': 'raf',
};

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

  private sanitizeFileName(fileName: string): string {
    const normalized = fileName.normalize('NFC').trim();
    const lastSegment = normalized.split(/[/\\]/).pop() ?? 'image';
    const withoutExtension = lastSegment.replace(/\.[^.]*$/, '');
    const safe = withoutExtension.replace(/[^0-9a-zA-Z._-]/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
    return safe.length > 80 ? safe.slice(0, 80) : safe || 'image';
  }

  async createPresignedUploadUrls(
    user: DecodedUserToken,
    dto: CreatePresignedUploadUrlDto,
  ): Promise<PresignedUploadUrlResponseDto> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    if (!bucket) {
      throw new InternalServerErrorException('AWS_S3_BUCKET is not configured.');
    }

    const uploads = await Promise.all(
      dto.files.map(async (file) => {
        if (!ALLOWED_IMAGE_CONTENT_TYPES.has(file.contentType)) {
          throw new BadRequestException(`지원하지 않는 이미지 형식입니다: ${file.contentType}`);
        }

        if (file.size && file.size > MAX_UPLOAD_FILE_SIZE) {
          throw new BadRequestException('이미지 최대 크기는 50MB입니다.');
        }

        const imageId = uuidv7();
        const extension = CONTENT_TYPE_EXTENSION_MAP[file.contentType] ?? 'bin';
        const safeOriginalName = this.sanitizeFileName(file.originalName);
        const key = `uploads/${user.id}/${Date.now()}-${imageId}-${safeOriginalName}.${extension}`;

        const image = this.imageRepository.create({
          id: imageId,
          key,
          uploader: { id: user.id } as User,
          exifData: null,
        });
        await this.imageRepository.save(image);

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ACL: 'public-read',
          ContentType: file.contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
        });

        return {
          imageId,
          key,
          uploadUrl,
          contentType: file.contentType,
          expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
        };
      }),
    );

    return plainToInstance(
      PresignedUploadUrlResponseDto,
      { uploads },
      { excludeExtraneousValues: true },
    );
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