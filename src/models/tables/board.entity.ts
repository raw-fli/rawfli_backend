import { Column, Entity, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { CommonColumns } from '../common/common-columns';

type BoardType = 'community' | 'gallery';

@Entity()
export class Board extends CommonColumns {
  @Column({ type: 'text' })
  type!: BoardType;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @OneToMany(() => Post, (post) => post.board)
  posts!: Post[];

  @Column({ default: 0 })
  maxPostId!: number;
}
