import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreatedAtColumn } from '../common/created-at.column';
import { User } from './user.entity';
import { Photo } from './photo.entity';

@Entity()
export class Image extends CreatedAtColumn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  key!: string;

  @ManyToOne(() => User, (user) => user.images)
  uploader!: User;

  @OneToMany(() => Photo, (photo) => photo.image)
  photos!: Photo[];
}
