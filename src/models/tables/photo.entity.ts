import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityPost, GalleryPost } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

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
