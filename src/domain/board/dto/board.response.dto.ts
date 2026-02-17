import { Expose } from 'class-transformer';

export class BoardResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  constructor(partial: Partial<BoardResponseDto>) {
    Object.assign(this, partial);
  }
}
