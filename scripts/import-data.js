#!/usr/bin/env node

/**
 * Import data from JSON files to MySQL database
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Function to get current datetime in MySQL format
function getCurrentDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// Function to import users
async function importUsers(connection) {
  console.log('Importing users...');
  const usersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'));
  const now = getCurrentDateTime();
  
  for (const user of usersData) {
    try {
      await connection.execute(
        'INSERT INTO users (name, email, role, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [user.name, user.email, user.role, user.avatar, now, now]
      );
      console.log(`Imported user: ${user.name}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`User ${user.name} already exists, skipping...`);
      } else {
        throw error;
      }
    }
  }
  console.log(`Imported ${usersData.length} users`);
}

// Function to import columns
async function importColumns(connection) {
  console.log('Importing columns...');
  const columnsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'columns.json'), 'utf8'));
  const now = getCurrentDateTime();
  let inserted = 0;

  for (const column of columnsData) {
    // Check if column exists by name and order
    const [rows] = await connection.execute(
      'SELECT id FROM columns WHERE name = ? AND `order` = ?',
      [column.name, column.order]
    );
    if (rows.length > 0) {
      console.log(`Column ${column.name} (order ${column.order}) already exists, skipping...`);
      continue;
    }
    try {
      await connection.execute(
        'INSERT INTO columns (name, `order`, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [column.name, column.order, now, now]
      );
      inserted++;
      console.log(`Imported column: ${column.name}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`Column ${column.name} already exists, skipping...`);
      } else {
        throw error;
      }
    }
  }
  console.log(`Actually inserted ${inserted} columns`);
}

// Function to import tasks
async function importTasks(connection) {
  console.log('Importing tasks...');
  const tasksData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tasks.json'), 'utf8'));
  const now = getCurrentDateTime();
  
  for (const task of tasksData) {
    try {
      await connection.execute(
        'INSERT INTO tasks (title, description, status, assignee_id, column_id, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.title, task.description, task.status, task.assignee_id, task.column_id, task.order, now, now]
      );
      console.log(`Imported task: ${task.title}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`Task ${task.title} already exists, skipping...`);
      } else {
        throw error;
      }
    }
  }
  console.log(`Imported ${tasksData.length} tasks`);
}

// Main function to import data
async function importData() {
  console.log('Import data script running...');
  console.log('Data directory:', DATA_DIR);
  
  try {
    // Check if files exist in the data directory
    const files = fs.readdirSync(DATA_DIR);
    console.log('Found files in data directory:', files);
    
    // Parse connection URL
    const url = new URL(process.env.DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      port: url.port || 3306,
      ssl: undefined // Disable SSL
    };
    
    // Create connection
    const connection = await mysql.createConnection(config);
    console.log('Connected to MySQL database');
    
    try {
      // Import users
      await importUsers(connection);
      
      // Import columns
      await importColumns(connection);
      
      // Import tasks
      await importTasks(connection);
      
      console.log('All data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    } finally {
      await connection.end();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

// Run the import
importData().then(success => {
  if (!success) {
    console.log('Failed to import data');
    process.exit(1);
  }
  process.exit(0);
}); 