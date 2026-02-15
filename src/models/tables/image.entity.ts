import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { CreatedAtColumn } from '../common/created-at.column';
import { User } from './user.entity';
import { Photo } from './photo.entity';

@Entity()
export class Image extends CreatedAtColumn {
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ type: 'text', unique: true })
  key!: string;

  @ManyToOne(() => User, (user) => user.images)
  uploader!: User;

  @OneToMany(() => Photo, (photo) => photo.image)
  photos!: Photo[];
}
