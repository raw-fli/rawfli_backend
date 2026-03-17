import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class MergeEquipmentDto {
  @ApiProperty({ type: Number, description: '병합 후 남길 target 장비 ID' })
  @IsInt()
  targetId: number;

  @ApiProperty({
    type: [Number],
    description: 'target으로 병합할 source 장비 ID 목록',
    example: [12, 13],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  sourceIds: number[];
}
