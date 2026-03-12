import { Column, Entity, OneToMany, Relation } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { CameraAlias } from './camera-alias.entity';

@Entity()
export class Camera extends CommonColumns {
  @Column({ type: 'text', nullable: true })
  brand!: string | null;

  @Column({ type: 'text' })
  modelName!: string;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @OneToMany(() => CameraAlias, (alias) => alias.camera)
  aliases!: Relation<CameraAlias[]>;
}
