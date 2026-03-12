import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { Lens } from './lens.entity';

@Entity()
export class LensAlias extends CommonColumns {
  @Column({ type: 'text', unique: true })
  rawExifName!: string;

  @ManyToOne(() => Lens, (lens) => lens.aliases, { onDelete: 'CASCADE' })
  lens!: Relation<Lens>;
}
