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
  
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create schema
    console.log('Creating tables...');
    
    // Create users table
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
    console.log('Created users table');
    
    // Create columns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created columns table');
    
    // Create tasks table
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
    console.log('Created tasks table');
    
    console.log('Schema creation complete!');
    
    return true;
  } catch (error) {
    console.error('Error creating schema:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    
    // Close the pool
    await pool.end();
  }
}

// Export the createSchema function for use in import-data.js
module.exports = createSchema;

// If this script is run directly, execute createSchema
if (require.main === module) {
  createSchema().then(success => {
    if (success) {
      console.log('Schema created successfully');
      process.exit(0);
    } else {
      console.error('Failed to create schema');
      process.exit(1);
    }
  }).catch(err => {
    console.error('Schema creation failed:', err);
    process.exit(1);
  });
} 