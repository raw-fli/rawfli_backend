import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { CreatedAtColumn } from 'src/common/entities/created-at.column';
import { User } from 'src/domain/user/entity/user.entity';
import { Photo } from 'src/domain/post/entity/photo.entity';

@Entity()
export class Image extends CreatedAtColumn {
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ type: 'text', unique: true })
  key!: string;

  @ManyToOne(() => User, (user) => user.images)
  uploader!: User;

  @OneToMany(() => Photo, (photo) => photo.image)
  photos!: Photo[];
}
