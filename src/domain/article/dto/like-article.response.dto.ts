import { Expose } from "class-transformer";


export class LikeArticleResponseDto {
  @Expose()
  liked: boolean;

  constructor(partial: Partial<LikeArticleResponseDto>) {
    Object.assign(this, partial);
  }
}