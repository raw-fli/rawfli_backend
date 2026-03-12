import {
  BeforeInsert,
  Column,
  Entity,
  Index,
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
import { Camera } from 'src/domain/camera/entity/camera.entity';
import { Lens } from 'src/domain/lens/entity/lens.entity';

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

  @Index()
  @Column({ type: 'int', nullable: true })
  iso!: number | null;

  @Index()
  @Column({ type: 'float', nullable: true })
  aperture!: number | null;

  @Column({ type: 'varchar', nullable: true })
  shutterSpeedDisplay!: string | null;

  @Index()
  @Column({ type: 'float', nullable: true })
  shutterSpeedValue!: number | null;

  @Column({ type: 'float', nullable: true })
  focalLength!: number | null;

  @ManyToOne(() => Camera, { nullable: true })
  @JoinColumn()
  camera!: Relation<Camera> | null;

  @ManyToOne(() => Lens, { nullable: true })
  @JoinColumn()
  lens!: Relation<Lens> | null;

  @ManyToMany('User', (user: User) => user.likedPhotos)
  likes!: Relation<User[]>;

  @ManyToMany('Article', 'referencedPhotos')
  referencedInArticles!: any[];
}
