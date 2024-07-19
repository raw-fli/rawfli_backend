import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { CommunityPost, GalleryPost } from './post.entity';
import { User } from './user.entity';
import { CommonColumns } from '../common/common-columns';

@Entity()
export class Photo extends CommonColumns {
  @ManyToOne(() => GalleryPost, (post) => post.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  @JoinColumn({ name: 'postBoardId', referencedColumnName: 'board' })
  post!: GalleryPost;

  @ManyToOne(() => User, (user) => user.photos)
  author!: User;

  @Column({ type: 'text' })
  description!: string;

  @ManyToMany(() => User, (user) => user.likedPhotos)
  likes!: User[];

  @ManyToMany(() => CommunityPost, (post) => post.referencedPhotos)
  referencedInPosts!: CommunityPost[];
}
