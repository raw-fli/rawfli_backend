import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeletedPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  originalPostId!: number;

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