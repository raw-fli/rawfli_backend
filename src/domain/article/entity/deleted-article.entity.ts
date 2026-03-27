import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeletedArticle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  originalArticleId!: number;

  @Column()
  boardId!: number;

  @Column()
  authorId!: number;

  @Column('text')
  title!: string;

  @Column('text')
  content!: string;

  @Column({ default: 0 })
  views!: number;

  @CreateDateColumn()
  originalCreatedAt!: Date;

  @CreateDateColumn()
  deletedAt!: Date;
}