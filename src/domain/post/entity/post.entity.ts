import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Relation,
} from 'typeorm';
import { User } from 'src/domain/user/entity/user.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { CommonColumns } from 'src/common/entities/common-columns';

@Entity()
export class Post extends CommonColumns {
  @ManyToOne('User', (user: User) => user.posts)
  author!: Relation<User>;

  @Column('text')
  title!: string;

  @Column('text')
  content!: string;

  @ManyToOne(() => Photo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coverPhotoId' })
  coverPhoto!: Relation<Photo> | null;

  @OneToMany('Photo', (photo: Photo) => photo.post)
  photos!: Relation<Photo[]>;
}
