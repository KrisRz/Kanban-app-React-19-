import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = (process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kanban').trim();
const isProduction = process.env.NODE_ENV === 'production';

const client = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
const db = drizzle(client, { schema });

export { db, client, migrate }; 