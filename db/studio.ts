import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { exec } from 'child_process';

// DB connection
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kanban';

async function runStudio() {
  // Create a postgres client with SSL explicitly disabled
  const client = postgres(connectionString, {
    ssl: false,
    max: 1
  });

  // Close any existing studio process
  exec('lsof -ti:4983 | xargs kill -9', () => {
    console.log('Starting Drizzle Studio with SSL disabled...');
    
    // Start Drizzle Studio with our custom client
    exec('npx drizzle-kit studio', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting Drizzle Studio: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Drizzle Studio stderr: ${stderr}`);
        return;
      }
      console.log(stdout);
    });
  });
}

runStudio(); 