#!/usr/bin/env node

/**
 * Create PostgreSQL database schema
 */

const { Pool } = require('pg');

async function createSchema() {
  // Check if DATABASE_URL environment variable is set
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }
  
  console.log('Creating database schema with CONNECTION URL:', process.env.DATABASE_URL.substring(0, 25) + '...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render PostgreSQL
    }
  });
  
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    
    // Create users table
    console.log('Creating users table if it does not exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully');
    
    // Create columns table
    console.log('Creating columns table if it does not exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS columns (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        position INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Columns table created successfully');
    
    // Create tasks table
    console.log('Creating tasks table if it does not exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        column_id VARCHAR(255) REFERENCES columns(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tasks table created successfully');
    
    // List all tables to verify
    console.log('Verifying tables created...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:', tablesResult.rows.map(row => row.table_name).join(', '));
    
    // Return success
    return true;
  } catch (error) {
    console.error('Error creating database schema:', error.message);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Database client released');
    }
    
    try {
      await pool.end();
      console.log('Database connection pool ended');
    } catch (endError) {
      console.error('Error ending pool:', endError.message);
    }
  }
}

// If the script is run directly
if (require.main === module) {
  createSchema()
    .then(success => {
      if (success) {
        console.log('Database schema created successfully');
        process.exit(0);
      } else {
        console.error('Failed to create database schema');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error in schema creation:', error);
      process.exit(1);
    });
} else {
  // Export the function to be used in other modules
  module.exports = createSchema;
} 