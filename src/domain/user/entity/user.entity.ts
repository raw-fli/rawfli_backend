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

  @OneToMany('Post', (post: Post) => post.author)
  posts!: Relation<Post[]>;

  @OneToMany('Comment', (comment: Comment) => comment.author)
  comments!: Relation<Comment[]>;

  @OneToMany(() => Image, (image) => image.uploader)
  images!: Image[];

  @OneToMany('Photo', (photo: Photo) => photo.author)
  photos!: Relation<Photo[]>;

  @ManyToMany('Post', (post: Post) => post.likes)
  @JoinTable({ name: 'users_liked_posts' })
  likedPosts!: Relation<Post[]>;

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
}
