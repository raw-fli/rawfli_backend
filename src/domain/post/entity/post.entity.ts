import {
  Column,
  ChildEntity,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  TableInheritance,
  JoinColumn,
  Relation,
} from 'typeorm';
import { Board } from 'src/domain/board/entity/board.entity';
import { TimeColumns } from 'src/common/entities/time-columns';
import type { User } from 'src/domain/user/entity/user.entity';
import type { Photo } from 'src/common/entities/photo.entity';
import type { Comment } from 'src/common/entities/comment.entity';

@Entity()
@TableInheritance({ column: { type: 'text', name: 'type' } })
export class Post extends TimeColumns {
  @PrimaryColumn()
  id!: number;

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

  @ManyToMany('User', (user: User) => user.likedPosts)
  likes!: Relation<User[]>;

  @Column({ default: 0 })
  views!: number;

  @OneToMany('Comment', (comment: Comment) => comment.post)
  comments!: Relation<Comment[]>;
}

@ChildEntity('gallery')
export class GalleryPost extends Post {
  @OneToMany('Photo', (photo: Photo) => photo.post)
  photos!: Relation<Photo[]>;
}
