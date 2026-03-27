import { Expose, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MyImageItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  key: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  cameraMake: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  cameraModel: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  lensMake: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  lensModel: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  iso: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  aperture: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  shutterSpeedDisplay: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  shutterSpeedValue: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  focalLength: number | null;

  @Expose()
  usedInPhotoCount: number;

  constructor(partial: Partial<MyImageItemResponseDto>) {
    Object.assign(this, partial);
  }
}

export class MyImageListResponseDto {
  @Expose()
  @Type(() => MyImageItemResponseDto)
  images: MyImageItemResponseDto[];

  @Expose()
  total: number;

  constructor(partial: Partial<MyImageListResponseDto>) {
    Object.assign(this, partial);
  }
}