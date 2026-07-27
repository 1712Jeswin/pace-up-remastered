import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// DATABASE_URL must be set before any DB call is made.
// We defer validation to runtime (not import time) so the build succeeds
// without a .env.local in CI or development before the DB is provisioned.
const sql = neon(process.env.DATABASE_URL ?? "");
export const db = drizzle(sql, { schema });
