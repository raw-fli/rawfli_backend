import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CommonColumns } from '../common/common-columns';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment extends CommonColumns {
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  @JoinColumn({ name: 'postBoardId', referencedColumnName: 'board' })
  post!: Post;

  @ManyToOne(() => User, (user) => user.comments)
  author!: User;

  @Column({ type: 'text' })
  content!: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'CASCADE' })
  parent?: Comment;
}
