import { IsArray, IsInt } from 'class-validator';

export class MergeEquipmentDto {
  @IsInt()
  targetId: number;

  @IsArray()
  @IsInt({ each: true })
  sourceIds: number[];
}
