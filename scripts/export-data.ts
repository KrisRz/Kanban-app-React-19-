// Script to export data from MySQL database for migration
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

// Get database connection string from environment variable
const dbUrl = process.env.DATABASE_URL;

async function exportData() {
  console.log('Exporting data from MySQL database...');
  
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  let connection;
  try {
    // Connect to the database
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(dbUrl);
    console.log('Connected to MySQL database');
    
    // Fetch users
    console.log('Fetching users...');
    const [users] = await connection.execute('SELECT * FROM users') as [any[], any];
    console.log(`Found ${users.length} users to export`);
    
    // Fetch tasks
    console.log('Fetching tasks...');
    const [tasks] = await connection.execute('SELECT * FROM tasks') as [any[], any];
    console.log(`Found ${tasks.length} tasks to export`);
    
    // Fetch columns
    console.log('Fetching columns...');
    const [columns] = await connection.execute('SELECT * FROM columns') as [any[], any];
    console.log(`Found ${columns.length} columns to export`);
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // Export data to JSON files
    fs.writeFileSync(
      path.join(dataDir, 'users.json'), 
      JSON.stringify(users, null, 2)
    );
    
    fs.writeFileSync(
      path.join(dataDir, 'tasks.json'), 
      JSON.stringify(tasks, null, 2)
    );
    
    fs.writeFileSync(
      path.join(dataDir, 'columns.json'), 
      JSON.stringify(columns, null, 2)
    );
    
    console.log('Data export complete!');
    console.log(`Files saved to: ${dataDir}`);
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

// Run the export
exportData(); 