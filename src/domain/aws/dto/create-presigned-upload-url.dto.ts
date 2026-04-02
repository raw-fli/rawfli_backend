import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class PresignedUploadFileDto {
  @ApiProperty({ example: 'IMG_1024.HEIC' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({ example: 'image/heic' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ example: 3145728, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024)
  size?: number;
}

export class CreatePresignedUploadUrlDto {
  @ApiProperty({ type: [PresignedUploadFileDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PresignedUploadFileDto)
  files: PresignedUploadFileDto[];
}
