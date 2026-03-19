import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface SequenceTarget {
  table: string;
  sequence: string;
}

@Injectable()
export class SequenceSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SequenceSyncService.name);

  private readonly targets: SequenceTarget[] = [
    { table: 'lens', sequence: 'lens_id_seq' },
    { table: 'camera', sequence: 'camera_id_seq' },
    { table: 'lens_alias', sequence: 'lens_alias_id_seq' },
    { table: 'camera_alias', sequence: 'camera_alias_id_seq' },
  ];

  constructor(private readonly dataSource: DataSource) { }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      return;
    }

    for (const target of this.targets) {
      await this.syncTarget(target);
    }
  }

  private async syncTarget(target: SequenceTarget): Promise<void> {
    const check = await this.dataSource.query(
      'SELECT to_regclass($1) AS table_reg, to_regclass($2) AS sequence_reg',
      [target.table, target.sequence],
    );

    if (!check[0]?.table_reg || !check[0]?.sequence_reg) {
      this.logger.warn(`Skip sequence sync: missing ${target.table} or ${target.sequence}`);
      return;
    }

    await this.dataSource.query(
      `SELECT setval($1::regclass, COALESCE((SELECT MAX(id) FROM "${target.table}"), 1), true)`,
      [target.sequence],
    );

    this.logger.log(`Sequence synced: ${target.sequence} -> ${target.table}.id`);
  }
}
