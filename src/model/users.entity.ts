import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['createdAt'])
export abstract class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'text', unique: true, nullable: false })
  email: string;

  @Column({ type: 'text', length: 21, nullable: false })
  username: string;

  @Column({ type: 'text', nullable: false })
  password: string;
}
