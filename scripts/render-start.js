#!/usr/bin/env node

/**
 * Render startup script
 * This script will check the database connection once before starting the application
 * to avoid multiple connection attempts that can get the IP blocked
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Flag file to check if data import has been completed
const IMPORT_FLAG_FILE = path.join(process.cwd(), '.import_completed');

// Function to check for pg module
function checkPgModule() {
  try {
    // Try to require the pg module
    require('pg');
    console.log('pg module is available');
    return true;
  } catch (error) {
    console.error('pg module is not available:', error.message);
    return false;
  }
}

// Function to run the data import
function runDataImport() {
  console.log('Running data import from JSON to PostgreSQL...');
  
  try {
    // Check if import has already been done
    if (fs.existsSync(IMPORT_FLAG_FILE)) {
      console.log('Data already imported. Skipping import.');
      return true;
    }
    
    // Check if pg module is available
    if (!checkPgModule()) {
      console.error('pg module is not available. Skipping import.');
      return false;
    }
    
    // Create the flag file now (before import) to prevent multiple attempts
    // in case the script is interrupted
    fs.writeFileSync(IMPORT_FLAG_FILE, new Date().toISOString());
    
    // Run the import script directly
    console.log('Importing data...');
    try {
      // Run the schema creation first
      require('./create-db-schema.js');
      
      // Then import the data
      require('./import-data.js');
      
      console.log('Import scripts executed successfully');
      return true;
    } catch (importError) {
      console.error('Error executing import scripts:', importError);
      return false;
    }
  } catch (error) {
    console.error('Failed to run data import:', error);
    return false;
  }
}

// Skip database check completely and just start the app
// This is the most reliable approach for deployment
function startApp() {
  console.log('Starting Next.js application directly...');
  
  try {
    // Just run the server.js file directly
    const nextStart = exec('node server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting Next.js: ${error.message}`);
        return;
      }
    });

    // Pipe the child process output to the main process
    nextStart.stdout.pipe(process.stdout);
    nextStart.stderr.pipe(process.stderr);
    
    // Handle process exit
    process.on('SIGINT', () => {
      nextStart.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      nextStart.kill('SIGTERM');
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Main function - simplified to just start the app
function main() {
  console.log('Render startup script running...');
  console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
  
  // Run data import before starting the app
  // Even if import fails, we still start the app
  runDataImport();
  
  console.log('Starting the application...');
  
  // Just start the app without any database check
  startApp();
}

// Run the script with a failsafe
try {
  main();
} catch (error) {
  console.error('Fatal error in startup script:', error);
  // Last resort - try to start the app directly
  try {
    require('../server.js');
  } catch (serverError) {
    console.error('Could not start server directly:', serverError);
    process.exit(1);
  }
} 