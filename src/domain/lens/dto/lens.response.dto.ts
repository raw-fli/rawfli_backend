import { Expose, Type } from 'class-transformer';

export class LensAliasResponseDto {
  @Expose()
  id: number;

  @Expose()
  rawExifName: string;

  constructor(partial: Partial<LensAliasResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LensResponseDto {
  @Expose()
  id: number;

  @Expose()
  brand: string | null;

  @Expose()
  modelName: string;

  @Expose()
  isVerified: boolean;

  @Expose()
  @Type(() => LensAliasResponseDto)
  aliases: LensAliasResponseDto[];

  constructor(partial: Partial<LensResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LensListResponseDto {
  @Expose()
  @Type(() => LensResponseDto)
  lenses: LensResponseDto[];

  @Expose()
  total: number;

  constructor(partial: Partial<LensListResponseDto>) {
    Object.assign(this, partial);
  }
}
