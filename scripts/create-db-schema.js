// Script to create the database schema in PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a new pool using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

async function createSchema() {
  console.log('Creating database schema in PostgreSQL...');
  console.log('Database URL is set:', !!process.env.DATABASE_URL);
  
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
    
    // Create schema
    console.log('Creating tables...');
    
    try {
      // Create users table
      console.log('Creating users table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(255),
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE
        )
      `);
      console.log('Created users table successfully');
      
      // Create columns table
      console.log('Creating columns table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS columns (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          "order" INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Created columns table successfully');
      
      // Create tasks table
      console.log('Creating tasks table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) NOT NULL,
          "assigneeId" INTEGER REFERENCES users(id),
          "columnId" INTEGER REFERENCES columns(id),
          "order" INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE
        )
      `);
      console.log('Created tasks table successfully');
      
      console.log('Schema creation complete!');
      
      // Verify tables exist
      console.log('Verifying tables exist...');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('Tables in database:', tables.rows.map(row => row.table_name).join(', '));
      
      return true;
    } catch (queryError) {
      console.error('Error executing SQL:', queryError);
      return false;
    }
  } catch (error) {
    console.error('Error creating schema:', error);
    return false;
  } finally {
    if (client) {
      console.log('Releasing database client');
      client.release();
    }
    
    // Close the pool
    try {
      console.log('Closing database pool');
      await pool.end();
      console.log('Database pool closed');
    } catch (endError) {
      console.error('Error closing pool:', endError);
    }
  }
}

// Export the createSchema function for use in import-data.js
module.exports = createSchema;

// If this script is run directly, execute createSchema
if (require.main === module) {
  createSchema().then(success => {
    if (success) {
      console.log('Schema created successfully when run directly');
      process.exit(0);
    } else {
      console.error('Failed to create schema when run directly');
      process.exit(1);
    }
  }).catch(err => {
    console.error('Schema creation failed with error:', err);
    process.exit(1);
  });
} 