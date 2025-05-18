#!/usr/bin/env node

/**
 * Import data from JSON files to PostgreSQL database
 */

const fs = require('fs');
const path = require('path');

// Flag file to check if data import has been completed - use /tmp directory which is writable
const IMPORT_FLAG_FILE = path.join('/tmp', '.import_completed');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Main function to import data
async function importData() {
  console.log('Import data script running...');
  console.log('Data directory:', DATA_DIR);
  
  try {
    // Check if files exist in the data directory
    const files = fs.readdirSync(DATA_DIR);
    console.log('Found files in data directory:', files);
    
    // Connect to the database
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database to import data');
    
    try {
      // Import users
      await importUsers(client);
      
      // Import columns
      await importColumns(client);
      
      // Import tasks
      await importTasks(client);
      
      console.log('All data imported successfully');
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

// Function to import users
async function importUsers(client) {
  try {
    // Check for existing users
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log('Existing user count:', userCount.rows[0].count);
    
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('Users already imported, skipping');
      return;
    }
    
    const usersFile = path.join(DATA_DIR, 'users.json');
    console.log('Reading users from:', usersFile);
    
    if (!fs.existsSync(usersFile)) {
      console.error('Users file not found:', usersFile);
      return;
    }
    
    const usersData = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(usersData);
    
    console.log(`Importing ${users.length} users to database...`);
    
    for (const user of users) {
      await client.query(
        'INSERT INTO users(id, name, email, role, avatar, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [user.id, user.name, user.email, user.role || 'User', user.avatar || null, new Date(), new Date()]
      );
    }
    
    console.log('Users imported successfully');
  } catch (error) {
    console.error('Error importing users:', error);
    throw error;
  }
}

// Function to import columns
async function importColumns(client) {
  try {
    // Check for existing columns
    const columnCount = await client.query('SELECT COUNT(*) FROM columns');
    console.log('Existing column count:', columnCount.rows[0].count);
    
    if (parseInt(columnCount.rows[0].count) > 0) {
      console.log('Columns already imported, skipping');
      return;
    }
    
    const columnsFile = path.join(DATA_DIR, 'columns.json');
    console.log('Reading columns from:', columnsFile);
    
    if (!fs.existsSync(columnsFile)) {
      console.error('Columns file not found:', columnsFile);
      return;
    }
    
    const columnsData = fs.readFileSync(columnsFile, 'utf8');
    const columns = JSON.parse(columnsData);
    
    console.log(`Importing ${columns.length} columns to database...`);
    
    for (const column of columns) {
      await client.query(
        'INSERT INTO columns(id, name, "order", created_at, updated_at) VALUES($1, $2, $3, $4, $5)',
        [column.id, column.name || column.title, column.order || column.position, new Date(), new Date()]
      );
    }
    
    console.log('Columns imported successfully');
  } catch (error) {
    console.error('Error importing columns:', error);
    throw error;
  }
}

// Function to import tasks
async function importTasks(client) {
  try {
    // Check for existing tasks
    const taskCount = await client.query('SELECT COUNT(*) FROM tasks');
    console.log('Existing task count:', taskCount.rows[0].count);
    
    if (parseInt(taskCount.rows[0].count) > 0) {
      console.log('Tasks already imported, skipping');
      return;
    }
    
    const tasksFile = path.join(DATA_DIR, 'tasks.json');
    console.log('Reading tasks from:', tasksFile);
    
    if (!fs.existsSync(tasksFile)) {
      console.error('Tasks file not found:', tasksFile);
      return;
    }
    
    const tasksData = fs.readFileSync(tasksFile, 'utf8');
    const tasks = JSON.parse(tasksData);
    
    console.log(`Importing ${tasks.length} tasks to database...`);
    
    for (const task of tasks) {
      await client.query(
        'INSERT INTO tasks(id, title, description, status, "assigneeId", "columnId", "order", created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          task.id, 
          task.title, 
          task.description || null, 
          task.status || null,
          task.assignee_id || task.assigneeId || null,
          task.column_id || task.columnId,
          task.order || task.position,
          new Date(), 
          new Date()
        ]
      );
    }
    
    console.log('Tasks imported successfully');
  } catch (error) {
    console.error('Error importing tasks:', error);
    throw error;
  }
}

// If this script is run directly, run the import function
if (require.main === module) {
  importData()
    .then(success => {
      if (success) {
        console.log('Data import completed successfully');
        process.exit(0);
      } else {
        console.error('Data import failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error in import process:', error);
      process.exit(1);
    });
}

// Export the function for use in other modules
module.exports = importData; 