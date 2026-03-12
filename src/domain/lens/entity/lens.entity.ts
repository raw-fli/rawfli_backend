import { Column, Entity, OneToMany, Relation } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { LensAlias } from './lens-alias.entity';

@Entity()
export class Lens extends CommonColumns {
  @Column({ type: 'text', nullable: true })
  brand!: string | null;

  @Column({ type: 'text' })
  modelName!: string;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @OneToMany(() => LensAlias, (alias) => alias.lens)
  aliases!: Relation<LensAlias[]>;
}
