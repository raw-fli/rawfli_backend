import { Column, Entity } from 'typeorm';
import { CommonColumns } from 'src/common/entities/common-columns';

export type DecodedAdminToken = Pick<Admin, 'id' | 'username'>;

@Entity()
export class Admin extends CommonColumns {
  @Column({ type: 'text', unique: true })
  username!: string;

  @Column({ type: 'text' })
  password!: string;
}
