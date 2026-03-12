import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhotoCameraResponseDto {
  @Expose()
  id: number;

  @Expose()
  brand: string | null;

  @Expose()
  modelName: string;

  constructor(partial: Partial<PhotoCameraResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PhotoLensResponseDto {
  @Expose()
  id: number;

  @Expose()
  brand: string | null;

  @Expose()
  modelName: string;

  constructor(partial: Partial<PhotoLensResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PhotoResponseDto {
  @Expose()
  id: string;

  @Expose()
  imageKey: string;

  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiPropertyOptional({ type: Number, nullable: true })
  iso: number | null;

  @Expose()
  @ApiPropertyOptional({ type: Number, nullable: true })
  aperture: number | null;

  @Expose()
  @ApiPropertyOptional({ type: String, nullable: true })
  shutterSpeedDisplay: string | null;

  @Expose()
  @ApiPropertyOptional({ type: Number, nullable: true })
  shutterSpeedValue: number | null;

  @Expose()
  @ApiPropertyOptional({ type: Number, nullable: true })
  focalLength: number | null;

  @Expose()
  @ApiPropertyOptional({ type: () => PhotoCameraResponseDto, nullable: true })
  @Type(() => PhotoCameraResponseDto)
  camera: PhotoCameraResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ type: () => PhotoLensResponseDto, nullable: true })
  @Type(() => PhotoLensResponseDto)
  lens: PhotoLensResponseDto | null;

  constructor(partial: Partial<PhotoResponseDto>) {
    Object.assign(this, partial);
  }
}
