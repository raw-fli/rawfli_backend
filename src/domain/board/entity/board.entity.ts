import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from 'src/domain/article/entity/article.entity';

type BoardType = 'community';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  type!: BoardType;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @OneToMany(() => Article, (article) => article.board)
  articles!: Article[];

  @Column({ default: 0 })
  maxPostId!: number;
}
