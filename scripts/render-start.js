#!/usr/bin/env node

/**
 * Render startup script
 * This script will check the database connection once before starting the application
 * to avoid multiple connection attempts that can get the IP blocked
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Flag file to check if data import has been completed - use /tmp directory which is writable
const IMPORT_FLAG_FILE = path.join('/tmp', '.import_completed');

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

// Function to run the schema creation directly
async function runSchemaCreation() {
  console.log('Creating database schema directly...');
  try {
    const createSchema = require('./create-db-schema');
    const success = await createSchema();
    console.log('Schema creation result:', success);
    return success;
  } catch (error) {
    console.error('Error creating schema directly:', error);
    return false;
  }
}

// Function to run the data import directly
async function runDataImport() {
  console.log('Running data import from JSON to PostgreSQL...');
  
  try {
    // Check if import has already been done
    if (fs.existsSync(IMPORT_FLAG_FILE)) {
      console.log('Import flag file exists, checking if tables actually exist...');
      // First verify the tables actually exist before skipping
      const tablesExist = await verifyTablesExist();
      if (tablesExist) {
        console.log('Tables verified to exist. Skipping import.');
        return true;
      } else {
        console.log('Tables do not exist despite flag file. Will re-import.');
        // Continue with import
        try {
          // Remove the flag file to allow reimport
          fs.unlinkSync(IMPORT_FLAG_FILE);
          console.log('Removed stale import flag file');
        } catch (err) {
          console.error('Error removing flag file:', err);
        }
      }
    }
    
    // Check if pg module is available
    if (!checkPgModule()) {
      console.error('pg module is not available. Skipping import.');
      return false;
    }
    
    // First create the schema
    console.log('Creating database schema...');
    const schemaCreated = await runSchemaCreation();
    if (!schemaCreated) {
      console.error('Failed to create schema. Aborting import.');
      return false;
    }
    
    // Now try to import the data
    try {
      console.log('Importing data from JSON...');
      // Import the data directly and await it
      const importData = require('./import-data');
      const importResult = await importData();
      
      if (importResult) {
        console.log('Data import completed successfully');
        
        // Create the flag file only after successful schema creation and import
        try {
          fs.writeFileSync(IMPORT_FLAG_FILE, new Date().toISOString());
          console.log('Created import flag file at', IMPORT_FLAG_FILE);
        } catch (flagError) {
          console.error('Could not create flag file, continuing anyway:', flagError.message);
        }
      } else {
        console.error('Data import failed');
      }
      
      // Verify tables exist after import
      const tablesExist = await verifyTablesExist();
      return tablesExist;
    } catch (importError) {
      console.error('Error executing import scripts:', importError);
      return false;
    }
  } catch (error) {
    console.error('Failed to run data import:', error);
    return false;
  }
}

// Function to verify if tables exist
async function verifyTablesExist() {
  try {
    console.log('Verifying if database tables exist...');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const client = await pool.connect();
    try {
      // Check if all required tables exist
      const tables = ['users', 'columns', 'tasks'];
      let allTablesExist = true;
      
      for (const table of tables) {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          ) AS exists
        `);
        
        const tableExists = result.rows[0].exists;
        console.log(`Table ${table} exists:`, tableExists);
        
        if (!tableExists) {
          allTablesExist = false;
          break;
        }
      }
      
      if (allTablesExist) {
        // If tables exist, check if they have data
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log('User count:', userCount.rows[0].count);
        
        const columnCount = await client.query('SELECT COUNT(*) FROM columns');
        console.log('Column count:', columnCount.rows[0].count);
        
        const taskCount = await client.query('SELECT COUNT(*) FROM tasks');
        console.log('Task count:', taskCount.rows[0].count);
      }
      
      return allTablesExist;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Error verifying tables:', error);
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
async function main() {
  console.log('Render startup script running...');
  console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
  
  // Run data import before starting the app
  // Even if import fails, we still start the app
  await runDataImport();
  
  console.log('Starting the application...');
  
  // Just start the app without any database check
  startApp();
}

// Run the script with a failsafe
try {
  main().catch(error => {
    console.error('Unhandled error in main:', error);
    // Still try to start the app
    startApp();
  });
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