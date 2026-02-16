import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: '제목을 입력해주세요.' })
  title: string;

  @IsString({ message: '내용을 입력해주세요.' })
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoDescriptions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referencedPhotoIds?: string[];
}
