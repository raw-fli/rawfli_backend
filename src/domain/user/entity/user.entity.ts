import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  Relation,
} from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';
import { Image } from 'src/domain/aws/entity/image.entity';
import { Comment } from 'src/common/entities/comment.entity';
import { Photo } from 'src/common/entities/photo.entity';
import { Post } from 'src/domain/post/entity/post.entity';
import { Article } from 'src/domain/article/entity/article.entity';
import { Follow } from './follow.entity';

export type DecodedUserToken = Pick<User, 'id' | 'email' | 'username'>;

@Entity()
@Index(['createdAt'])
export class User extends CommonColumns {
  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  username!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text', nullable: true })
  profileImageKey!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @OneToMany('Article', (article: Article) => article.author)
  articles!: Relation<Article[]>;

  @OneToMany('Post', (post: Post) => post.author)
  posts!: Relation<Post[]>;

  @OneToMany('Comment', (comment: Comment) => comment.author)
  comments!: Relation<Comment[]>;

  @OneToMany(() => Image, (image) => image.uploader)
  images!: Image[];

  @OneToMany('Photo', (photo: Photo) => photo.author)
  photos!: Relation<Photo[]>;

  @ManyToMany('Article', (article: Article) => article.likes)
  @JoinTable({ name: 'users_liked_articles' })
  likedArticles!: Relation<Article[]>;

  @ManyToMany('Photo', (photo: Photo) => photo.likes)
  @JoinTable({ name: 'users_liked_photos' })
  likedPhotos!: Relation<Photo[]>;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_blocks',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blockedUserId', referencedColumnName: 'id' },
  })
  blockedUsers!: User[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers!: Follow[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followings!: Follow[];
}
