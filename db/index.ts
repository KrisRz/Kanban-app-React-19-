import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import { drizzle as drizzleMySQL } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// For use in a Node.js environment
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kanban';

// Determine if we should use SSL based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Determine if we're using MySQL (for the free database) or Postgres (local)
const isMySQL = connectionString.includes('mysql://');

// Database client and connection
let db: any;

if (process.env.SKIP_DB_CONNECT === 'true') {
  // More comprehensive mock implementation
  const mockQueryResult = [];
  
  // Create a complete mock DB object
  db = {
    select: () => ({
      from: () => mockQueryResult,
      where: () => mockQueryResult,
      orderBy: () => mockQueryResult
    }),
    query: {
      users: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
      },
      columns: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
      },
      tasks: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
      }
    },
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([])
        })
      })
    }),
    delete: () => ({
      where: () => Promise.resolve([])
    })
  };
} else {
  if (isMySQL) {
    // MySQL connection for freesqldatabase.com
    const connectionPool = mysql.createPool({
      uri: connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined
    });
    
    // Create drizzle MySQL instance with the mode parameter
    db = drizzleMySQL(connectionPool, { schema, mode: 'default' });
  } else {
    // Postgres connection for local development
    // Connection options
    const connectionOptions = {
      max: 1,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    };

    // Connection pool for direct queries
    const queryClient = postgres(connectionString, connectionOptions);

    // Create drizzle instance
    db = drizzle(queryClient, { schema });
  }
}

export { db };

// Migration function
export async function runMigrations() {
  console.log('Running migrations...');
  
  if (process.env.SKIP_DB_CONNECT === 'true') {
    console.log('Skipping migrations due to SKIP_DB_CONNECT');
    return;
  }
  
  if (isMySQL) {
    console.log('MySQL migrations are not supported through this function. Please use db:push instead.');
    return;
  }
  
  try {
    const migrationClient = postgres(connectionString, {
      max: 1,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    
    await migrate(drizzle(migrationClient), {
      migrationsFolder: './db/migrations',
    });
    
    console.log('Migrations completed successfully');
    await migrationClient.end();
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
} 