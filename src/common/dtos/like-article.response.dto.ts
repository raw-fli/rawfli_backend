import { Expose } from "class-transformer";


export class LikePostResponseDto {
  @Expose()
  liked: boolean;

  constructor(partial: Partial<LikePostResponseDto>) {
    Object.assign(this, partial);
  }
}