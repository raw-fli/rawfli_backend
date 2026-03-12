import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { Camera } from './camera.entity';

@Entity()
export class CameraAlias extends CommonColumns {
  @Column({ type: 'text', unique: true })
  rawExifName!: string;

  @ManyToOne(() => Camera, (camera) => camera.aliases, { onDelete: 'CASCADE' })
  camera!: Relation<Camera>;
}
