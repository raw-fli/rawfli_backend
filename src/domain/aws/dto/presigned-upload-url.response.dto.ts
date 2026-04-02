import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PresignedUploadUrlItemResponseDto {
  @Expose()
  @ApiProperty({ example: '018f9b6f-3db4-71a4-a7cb-4578a7ad2a44' })
  imageId: string;

  @Expose()
  @ApiProperty({ example: 'uploads/12/1712154651223-018f9b6f-3db4-71a4-a7cb-4578a7ad2a44.heic' })
  key: string;

  @Expose()
  @ApiProperty({ example: 'https://bucket.s3.ap-northeast-2.amazonaws.com/uploads/...' })
  uploadUrl: string;

  @Expose()
  @ApiProperty({ example: 'image/heic' })
  contentType: string;

  @Expose()
  @ApiProperty({ example: 300 })
  expiresIn: number;

  constructor(partial: Partial<PresignedUploadUrlItemResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PresignedUploadUrlResponseDto {
  @Expose()
  @Type(() => PresignedUploadUrlItemResponseDto)
  uploads: PresignedUploadUrlItemResponseDto[];

  constructor(partial: Partial<PresignedUploadUrlResponseDto>) {
    Object.assign(this, partial);
  }
}
