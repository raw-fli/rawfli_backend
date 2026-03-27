import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { Board } from 'src/domain/board/entity/board.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { Comment } from 'src/common/entities/comment.entity';
import { CommonColumns } from 'src/common/entities/common-columns';

@Entity()
export class Article extends CommonColumns {
  @ManyToOne(() => Board, (board) => board.articles)
  @JoinColumn({ name: 'boardId' })
  board!: Board;

  @ManyToOne('User', (user: User) => user.articles)
  author!: Relation<User>;

  @Column('text')
  title!: string;

  @Column('text')
  content!: string;

  @ManyToMany('User', (user: User) => user.likedArticles)
  likes!: Relation<User[]>;

  @Column({ default: 0 })
  views!: number;

  @OneToMany('Comment', (comment: Comment) => comment.article)
  comments!: Relation<Comment[]>;

  @Column({ default: 0 })
  commentCount!: number;

  @Column({ default: 0 })
  likeCount!: number;

  @ManyToMany(() => Photo, (photo) => photo.referencedInArticles)
  @JoinTable({ name: 'article_referenced_photos' })
  referencedPhotos!: Photo[];

  @ManyToMany(() => Image)
  @JoinTable({ name: 'article_attached_images' })
  attachedImages!: Image[];
}
