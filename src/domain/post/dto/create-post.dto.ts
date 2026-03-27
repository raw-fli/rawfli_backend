import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePostPhotoDto {
  @IsUUID('all', { message: '유효한 이미지 ID를 입력해주세요.' })
  imageId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  iso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  aperture?: number;

  @IsOptional()
  @IsString()
  shutterSpeed?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  focalLength?: number;

  @IsOptional()
  @IsString()
  cameraModel?: string;

  @IsOptional()
  @IsString()
  cameraBrand?: string;

  @IsOptional()
  @IsString()
  lensModel?: string;

  @IsOptional()
  @IsString()
  lensBrand?: string;
}

export class CreatePostDto {
  @IsString({ message: '제목을 입력해주세요.' })
  title: string;

  @IsString({ message: '내용을 입력해주세요.' })
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostPhotoDto)
  photos?: CreatePostPhotoDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoDescriptions?: string[];
}
