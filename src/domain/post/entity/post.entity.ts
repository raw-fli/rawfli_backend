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

@ChildEntity('gallery')
export class GalleryPost extends Post {
  @OneToMany(() => Photo, (photo) => photo.post)
  photos!: Photo[];
}
