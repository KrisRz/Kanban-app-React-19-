#!/usr/bin/env node

/**
 * Render startup script
 * This script will check the database connection once before starting the application
 * to avoid multiple connection attempts that can get the IP blocked
 */

const { exec } = require('child_process');
const net = require('net');

// Parse the database URL
const connectionString = process.env.DATABASE_URL;

// Function to check if a port is reachable
function checkPort(host, port, timeout = 10000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    let error = null;

    // Set timeout
    socket.setTimeout(timeout);

    // Handle successful connection
    socket.on('connect', () => {
      status = true;
      socket.end();
    });

    // Handle timeout
    socket.on('timeout', () => {
      error = new Error('Connection timeout');
      socket.destroy();
    });

    // Handle errors
    socket.on('error', (err) => {
      error = err;
    });

    // Handle close
    socket.on('close', () => {
      resolve({ status, error });
    });

    // Attempt connection
    socket.connect(port, host);
  });
}

async function checkDatabaseConnection() {
  if (!connectionString || !connectionString.includes('mysql://')) {
    console.log('No MySQL connection string found, skipping connection check');
    return true;
  }

  try {
    // Extract connection details from the connection string
    const connectionDetails = connectionString.replace('mysql://', '').split('@');
    const [, hostPort] = connectionDetails;
    const [host, portDb] = hostPort.split(':');
    const port = portDb ? portDb.split('/')[0] : '3306';

    console.log(`Checking MySQL host connectivity: ${host}:${port} (TCP check only)`);

    // Just check if the host/port is reachable
    const { status, error } = await checkPort(host, parseInt(port, 10));
    
    if (status) {
      console.log('MySQL host is reachable');
      return true;
    } else {
      console.error('MySQL host is not reachable:', error?.message || 'Unknown error');
      console.log('Application will still start, but database functionality may be limited');
      return false;
    }
  } catch (error) {
    console.error('MySQL connectivity check failed:', error);
    console.log('Application will still start, but database functionality may be limited');
    // We don't fail here - let the app handle database unavailability gracefully
    return false;
  }
}

// Start the Next.js application
function startApp() {
  console.log('Starting Next.js application...');
  
  // Just run the server.js file directly instead of using npm start
  const nextStart = exec('node server.js', (error, stdout, stderr) => {
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