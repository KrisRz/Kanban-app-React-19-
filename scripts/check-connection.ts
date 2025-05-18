#!/usr/bin/env node

/**
 * Database connection test script
 * Run this script to test if the app can connect to the MySQL database
 */

import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

// Database connection string with default for testing
const dbUrl = process.env.DATABASE_URL || 'mysql://sql8779451:M8hGX38u74@sql8.freesqldatabase.com:3306/sql8779451';

async function checkConnection() {
  console.log('MySQL Connection Test');
  console.log('====================');
  console.log('Using connection string (with password redacted):');
  const maskedUrl = dbUrl.replace(/:(.*?)@/, ':[REDACTED]@');
  console.log(maskedUrl);
  
  try {
    // Extract connection details from the connection string
    const connectionDetails = dbUrl.replace('mysql://', '').split('@');
    const [userPass, hostPort] = connectionDetails;
    const [user, password] = userPass.split(':');
    const [host, portDb] = hostPort.split(':');
    const [port, database] = portDb ? portDb.split('/') : ['3306', hostPort.split('/')[1]];
    
    console.log(`\nConnection details:`);
    console.log(`Host: ${host}`);
    console.log(`Database: ${database}`);
    console.log(`User: ${user}`);
    console.log(`Port: ${port}`);
    
    // Create a connection
    console.log('\nAttempting connection...');
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port: Number(port)
    });
    
    // Test the connection with a simple query
    console.log('Running test query...');
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('Query result:', result);
    
    console.log('\n✅ SUCCESS: Database connection successful!');
    
    // Check if tables exist
    console.log('\nChecking database tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables);
    
    // Close the connection
    await connection.end();
    console.log('\nConnection closed.');
    
  } catch (error) {
    console.error('\n❌ ERROR: Database connection failed:');
    console.error(error);
  }
}

// Run the test
checkConnection().catch(console.error); 