import { IsOptional, IsUUID } from 'class-validator';

export class SetCoverPhotoDto {
  @IsOptional()
  @IsUUID()
  photoId?: string | null;
}