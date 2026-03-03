import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { Post } from 'src/domain/post/entity/post.entity';
import { User } from 'src/domain/user/entity/user.entity';

@Entity()
export class Comment extends CommonColumns {
  @ManyToOne('Post', (post: Post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  @JoinColumn({ name: 'postBoardId', referencedColumnName: 'board' })
  post!: Relation<Post>;

  @ManyToOne('User', (user: User) => user.comments)
  author!: Relation<User>;

  @Column({ type: 'text' })
  content!: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'CASCADE' })
  parent?: Comment;
}
