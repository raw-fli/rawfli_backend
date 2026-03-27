import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { Article } from 'src/domain/article/entity/article.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { User } from 'src/domain/user/entity/user.entity';

@Entity()
export class Comment extends CommonColumns {
  @ManyToOne('Article', (article: Article) => article.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'articleId', referencedColumnName: 'id' })
  article?: Relation<Article>;

  @ManyToOne('Photo', (photo: Photo) => photo.comments, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'photoId', referencedColumnName: 'id' })
  photo?: Relation<Photo>;

  @ManyToOne('User', (user: User) => user.comments)
  author!: Relation<User>;

  @Column({ type: 'text' })
  content!: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'CASCADE' })
  parent?: Comment;
}
