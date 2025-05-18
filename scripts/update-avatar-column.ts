// Script to modify the avatar column type to accommodate large base64 strings
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection string
const dbUrl = process.env.DATABASE_URL || 'mysql://username:password@localhost:3306/database';

async function updateAvatarColumn() {
  console.log('Connecting to database...');
  
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbUrl);
    
    console.log('Connected. Checking current column type...');
    
    // First, let's check the current column type
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar'`,
      [connection.config.database]
    );
    
    console.log('Current column info:', columns);
    
    // Update the avatar column to LONGTEXT type to store large base64 strings
    console.log('Modifying avatar column to LONGTEXT...');
    await connection.execute('ALTER TABLE users MODIFY COLUMN avatar LONGTEXT');
    
    console.log('Column updated successfully!');
  } catch (error) {
    console.error('Error updating avatar column:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the update function
updateAvatarColumn(); 