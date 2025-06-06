import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load environment variables
config();

// Get the database URL from environment or use default
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kanban';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Database configuration
const dbConfig = connectionString.includes('@')
  ? { connectionString, ssl: isProduction ? { rejectUnauthorized: false } : false }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'kanban',
      ssl: isProduction
    };

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: dbConfig,
  verbose: true,
  strict: true,
} as Config); 