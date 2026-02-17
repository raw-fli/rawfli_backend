import { BaseEntity, CreateDateColumn } from 'typeorm';

export abstract class CreatedAtColumn extends BaseEntity {
  @CreateDateColumn()
  public readonly createdAt!: Date | string;
}
