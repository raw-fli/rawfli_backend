import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
  Relation,
} from 'typeorm';
import { Board } from 'src/domain/board/entity/board.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { CommonColumns } from 'src/common/entities/common-columns';

@Entity()
export class Post extends CommonColumns {
  @PrimaryColumn({ type: 'int', name: 'boardId' })
  @ManyToOne(() => Board, (board) => board.posts)
  @JoinColumn({ name: 'boardId' })
  board!: Board;

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
