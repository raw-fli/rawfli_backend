import { Expose, Type } from 'class-transformer';

export class CameraAliasResponseDto {
  @Expose()
  id: number;

  @Expose()
  rawExifName: string;

  constructor(partial: Partial<CameraAliasResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CameraResponseDto {
  @Expose()
  id: number;

  @Expose()
  brand: string | null;

  @Expose()
  modelName: string;

  @Expose()
  isVerified: boolean;

  @Expose()
  @Type(() => CameraAliasResponseDto)
  aliases: CameraAliasResponseDto[];

  constructor(partial: Partial<CameraResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CameraListResponseDto {
  @Expose()
  @Type(() => CameraResponseDto)
  cameras: CameraResponseDto[];

  @Expose()
  total: number;

  constructor(partial: Partial<CameraListResponseDto>) {
    Object.assign(this, partial);
  }
}
