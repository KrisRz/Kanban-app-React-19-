import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

// For use in a Node.js environment
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kanban';

// Connection pool for direct queries - explicitly disable SSL
const queryClient = postgres(connectionString, { 
  max: 1,
  ssl: false 
});

// Create drizzle instance
export const db = drizzle(queryClient, { schema });

// Migration function
export async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    const migrationClient = postgres(connectionString, { 
      max: 1,
      ssl: false 
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