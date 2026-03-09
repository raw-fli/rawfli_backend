import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { CreatedAtColumn } from 'src/common/entities/created-at.column';
import { User } from 'src/domain/user/entity/user.entity';
import { Photo } from 'src/common/entities/photo.entity';

@Entity()
export class Image extends CreatedAtColumn {
  @ApiProperty({ example: 'uuid-v7' })
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @ApiProperty({ example: 'uploads/image.png' })
  @Column({ type: 'text', unique: true })
  key!: string;

  @ManyToOne(() => User, (user) => user.images)
  uploader!: User;

  @OneToMany(() => Photo, (photo) => photo.image)
  photos!: Photo[];
}
