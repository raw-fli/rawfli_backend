import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Image } from 'src/domain/aws/entity/image.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { Post } from 'src/domain/post/entity/post.entity';

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

  @ManyToOne('Post', (post: Post) => post.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  @JoinColumn({ name: 'postBoardId', referencedColumnName: 'board' })
  post!: Relation<Post>;

  @ManyToOne('User', (user: User) => user.photos)
  author!: Relation<User>;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany('User', (user: User) => user.likedPhotos)
  likes!: Relation<User[]>;

  @ManyToMany('Article', 'referencedPhotos')
  referencedInArticles!: any[];
}
