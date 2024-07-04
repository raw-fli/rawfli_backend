import * as dotenv from 'dotenv';
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import pg from 'pg';
import { exit } from 'process';

import * as allSchema from './schema';

dotenv.config();

(async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  let db: NodePgDatabase<typeof allSchema> | null = null;
  db = drizzle(pool, {
    schema: {
      ...allSchema,
    },
  });

  const migrationPath = path.join(process.cwd(), 'src/drizzle/migrations');

  await migrate(db, { migrationsFolder: migrationPath });

  console.log('Migration complete');
  exit(0);
})();
