import {
  Column,
  ChildEntity,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  TableInheritance,
  JoinColumn,
} from 'typeorm';
import { Board } from 'src/domain/board/entity/board.entity';
import { Comment } from './comment.entity';
import { Photo } from './photo.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { TimeColumns } from 'src/common/entities/time-columns';

@Entity()
@TableInheritance({ column: { type: 'text', name: 'type' } })
export class Post extends TimeColumns {
  @PrimaryColumn()
  id!: number;

  @PrimaryColumn({ type: 'int', name: 'boardId' })
  @ManyToOne(() => Board, (board) => board.posts)
  @JoinColumn({ name: 'boardId' })
  board!: Board;

  @ManyToOne(() => User, (user) => user.posts)
  author!: User;

  @Column('text')
  title!: string;

  @Column('text')
  content!: string;

  @ManyToMany(() => User, (user) => user.likedPosts)
  likes!: User[];

  @Column({ default: 0 })
  views!: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];
}

@ChildEntity('community')
export class CommunityPost extends Post {
  @ManyToMany(() => Photo, (photo) => photo.referencedInPosts)
  @JoinTable()
  referencedPhotos!: Photo[];
}

@ChildEntity('gallery')
export class GalleryPost extends Post {
  @OneToMany(() => Photo, (photo) => photo.post)
  photos!: Photo[];
}
