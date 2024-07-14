import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Comment } from './comment.entity';
import { CommonColumns } from '../common/common-columns';
import { Photo } from './photo.entity';
import { Post } from './post.entity';

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

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];

  @OneToMany(() => Photo, (photo) => photo.author)
  photos!: Photo[];

  @ManyToMany(() => Post, (post) => post.likes)
  @JoinTable({ name: 'users_liked_posts' })
  likedPosts!: Post[];

  @ManyToMany(() => Photo, (photo) => photo.likes)
  @JoinTable({ name: 'users_liked_photos' })
  likedPhotos!: Photo[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_blocks',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'blockedUserId',
      referencedColumnName: 'id',
    },
  })
  blockedUsers!: User[];
}
