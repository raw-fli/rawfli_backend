import { BaseEntity, CreateDateColumn } from 'typeorm';

export abstract class CreatedAtColumn extends BaseEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  public readonly createdAt!: Date | string;
}
