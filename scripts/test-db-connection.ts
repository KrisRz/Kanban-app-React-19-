// Test database connection script
import { db } from '../db';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set database URL manually if not in .env file
process.env.DATABASE_URL = process.env.DATABASE_URL || 
  "mysql://sql8779451:M8hGX38u74@sql8.freesqldatabase.com:3306/sql8779451";

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    console.log('Using connection string:', process.env.DATABASE_URL);
    
    // Perform a simple query to test connection
    const result = await db.query.users.findMany();
    console.log('Connection successful!');
    console.log('Found users:', result.length);
    
    if (result.length > 0) {
      console.log('Sample user:', {
        id: result[0].id,
        name: result[0].name,
        email: result[0].email
      });
    } else {
      console.log('No users found in database.');
    }
    
    // Test columns table
    const columns = await db.query.columns.findMany();
    console.log('Found columns:', columns.length);
    
    if (columns.length > 0) {
      console.log('Sample columns:', columns.map(c => ({ id: c.id, name: c.name })));
    }
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection(); 