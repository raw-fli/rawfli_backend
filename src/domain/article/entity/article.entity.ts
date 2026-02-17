import { ChildEntity, JoinTable, ManyToMany } from 'typeorm';
import { Post } from 'src/domain/post/entity/post.entity';
import { Photo } from 'src/domain/post/entity/photo.entity';
import { Image } from 'src/domain/aws/entity/image.entity';

@ChildEntity('community')
export class Article extends Post {

  @ManyToMany(() => Photo, (photo) => photo.referencedInArticles)
  @JoinTable({ name: 'article_referenced_photos' })
  referencedPhotos!: Photo[];

  @ManyToMany(() => Image)
  @JoinTable({ name: 'article_attached_images' })
  attachedImages!: Image[];
}
