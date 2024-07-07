import { Column, Entity, Index } from 'typeorm';
import { CommonColumns } from '../common/common-columns';

export type DecodedUserToken = Pick<User, 'id' | 'email' | 'username'>;

@Entity()
@Index(['createdAt'])
export class User extends CommonColumns {
  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  username!: string;

  @Column({ type: 'text' })
  password!: string;
}
