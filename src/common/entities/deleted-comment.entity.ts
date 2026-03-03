import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeletedComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  originalCommentId!: number;

  @Column()
  postId!: number;

  @Column()
  boardId!: number;

  @Column()
  authorId!: number;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  originalCreatedAt!: Date;

  @CreateDateColumn()
  deletedAt!: Date;
}
