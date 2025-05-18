#!/usr/bin/env node

/**
 * Render startup script
 * This script will check the database connection once before starting the application
 * to avoid multiple connection attempts that can get the IP blocked
 */

const mysql = require('mysql2/promise');
const { exec } = require('child_process');

// Parse the database URL
const connectionString = process.env.DATABASE_URL;

async function checkDatabaseConnection() {
  if (!connectionString || !connectionString.includes('mysql://')) {
    console.log('No MySQL connection string found, skipping connection check');
    return true;
  }

  try {
    // Extract connection details from the connection string
    const connectionDetails = connectionString.replace('mysql://', '').split('@');
    const [userPass, hostPort] = connectionDetails;
    const [user, password] = userPass.split(':');
    const [host, portDb] = hostPort.split(':');
    const [port, database] = portDb ? portDb.split('/') : ['3306', hostPort.split('/')[1]];

    console.log(`Checking MySQL connection to database: ${database} on host: ${host} (Once only)`);

    // Create a single connection (not a pool) for the initial test
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port: Number(port),
      connectTimeout: 10000,
      ssl: undefined
    });

    // Test connection with a simple query
    await connection.query('SELECT 1');
    console.log('MySQL connection test successful');
    
    // Close connection
    await connection.end();
    return true;
  } catch (error) {
    console.error('MySQL connection test failed:', error);
    console.log('Application will still start, but database functionality may be limited');
    // We don't fail here - let the app handle database unavailability gracefully
    return false;
  }
}

// Start the Next.js application
function startApp() {
  console.log('Starting Next.js application...');
  const nextStart = exec('npm start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Next.js: ${error.message}`);
      return;
    }
  });

  // Pipe the child process output to the main process
  nextStart.stdout.pipe(process.stdout);
  nextStart.stderr.pipe(process.stderr);
}

// Main function
async function main() {
  console.log('Render startup script running...');
  
  // Check database connection before starting the app
  await checkDatabaseConnection();
  
  // Start the app regardless of database connection status
  startApp();
}

// Run the script
main().catch(error => {
  console.error('Fatal error in startup script:', error);
  // Start the app anyway to avoid deployment failure
  startApp();
}); 