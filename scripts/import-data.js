// Script to import data from JSON files to PostgreSQL database
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const createSchema = require('./create-db-schema');

// Flag file to check if data import has been completed - use /tmp directory which is writable
const IMPORT_FLAG_FILE = path.join('/tmp', '.import_completed');

// Create a new pool using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

async function importData() {
  console.log('Importing data into PostgreSQL database...');
  
  // Check if import has already been done
  if (fs.existsSync(IMPORT_FLAG_FILE)) {
    console.log('Data already imported (flag file exists). Skipping import.');
    return true;
  }
  
  let client;
  try {
    // Create schema if not already created
    console.log('Creating database schema if needed...');
    const schemaResult = await createSchema();
    if (!schemaResult) {
      console.error('Schema creation failed. Cannot import data.');
      return false;
    }
    
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Read the exported data from JSON files
    const dataDir = path.join(process.cwd(), 'data');
    console.log('Data directory:', dataDir);
    
    // List files in the data directory to verify they exist
    try {
      const files = fs.readdirSync(dataDir);
      console.log('Files in data directory:', files.join(', '));
    } catch (err) {
      console.error('Error reading data directory:', err);
      return false;
    }
    
    console.log('Reading exported data files...');
    
    let usersData, tasksData, columnsData;
    
    try {
      usersData = JSON.parse(
        fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8')
      );
      
      tasksData = JSON.parse(
        fs.readFileSync(path.join(dataDir, 'tasks.json'), 'utf-8')
      );
      
      columnsData = JSON.parse(
        fs.readFileSync(path.join(dataDir, 'columns.json'), 'utf-8')
      );
      
      console.log(`Found: ${usersData.length} users, ${tasksData.length} tasks, ${columnsData.length} columns`);
    } catch (readError) {
      console.error('Error reading data files:', readError);
      return false;
    }
    
    // Check if columns already exist
    try {
      const columnsExist = await client.query('SELECT COUNT(*) FROM columns');
      if (columnsExist.rows[0].count > 0) {
        console.log('Columns already exist in the database. Skipping column import.');
      } else {
        // Import columns
        console.log('Importing columns...');
        for (const column of columnsData) {
          await client.query(
            'INSERT INTO columns (id, name, "order") VALUES ($1, $2, $3)',
            [column.id, column.name, column.order]
          );
        }
        console.log(`Imported ${columnsData.length} columns`);
      }
    } catch (columnError) {
      console.error('Error importing columns:', columnError);
      return false;
    }
    
    // Check if users already exist
    try {
      const usersExist = await client.query('SELECT COUNT(*) FROM users');
      if (usersExist.rows[0].count > 0) {
        console.log('Users already exist in the database. Skipping user import.');
      } else {
        // Import users
        console.log('Importing users...');
        for (const user of usersData) {
          await client.query(
            'INSERT INTO users (id, name, email, role, avatar) VALUES ($1, $2, $3, $4, $5)',
            [user.id, user.name, user.email, user.role, user.avatar]
          );
        }
        console.log(`Imported ${usersData.length} users`);
      }
    } catch (userError) {
      console.error('Error importing users:', userError);
      return false;
    }
    
    // Check if tasks already exist
    try {
      const tasksExist = await client.query('SELECT COUNT(*) FROM tasks');
      if (tasksExist.rows[0].count > 0) {
        console.log('Tasks already exist in the database. Skipping task import.');
      } else {
        // Import tasks
        console.log('Importing tasks...');
        for (const task of tasksData) {
          await client.query(
            'INSERT INTO tasks (id, title, description, status, "assigneeId", "columnId", "order") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [task.id, task.title, task.description, task.status, task.assignee_id, task.column_id, task.order]
          );
        }
        console.log(`Imported ${tasksData.length} tasks`);
      }
    } catch (taskError) {
      console.error('Error importing tasks:', taskError);
      return false;
    }
    
    console.log('Data import complete!');
    
    // Create the flag file to indicate import has been completed
    try {
      if (!fs.existsSync(IMPORT_FLAG_FILE)) {
        fs.writeFileSync(IMPORT_FLAG_FILE, new Date().toISOString());
        console.log('Created import flag file at', IMPORT_FLAG_FILE, 'to prevent future imports.');
      }
    } catch (flagError) {
      console.error('Could not create flag file:', flagError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    
    // Close the pool
    try {
      await pool.end();
      console.log('Database connection closed');
    } catch (endError) {
      console.error('Error closing pool:', endError);
    }
  }
}

// If this script is run directly, execute importData
if (require.main === module) {
  importData().then((success) => {
    if (success) {
      console.log('Import script completed successfully');
    } else {
      console.error('Import script completed with errors');
    }
    process.exit(0);
  }).catch(err => {
    console.error('Import script failed with unhandled error:', err);
    process.exit(1);
  });
} else {
  // If required as a module, export the function
  module.exports = importData;
} 