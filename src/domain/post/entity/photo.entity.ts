import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { CommunityPost, GalleryPost } from './post.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { Image } from 'src/domain/aws/entity/image.entity';

@Entity()
export class Photo {
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @ManyToOne(() => Image, (image) => image.photos, { eager: true })
  @JoinColumn()
  image!: Image;

  @ManyToOne(() => GalleryPost, (post) => post.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  @JoinColumn({ name: 'postBoardId', referencedColumnName: 'board' })
  post!: GalleryPost;

  @ManyToOne(() => User, (user) => user.photos)
  author!: User;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.likedPhotos)
  likes!: User[];

  @ManyToMany(() => CommunityPost, (post) => post.referencedPhotos)
  referencedInPosts!: CommunityPost[];
}
