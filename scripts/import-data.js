// Script to import data from JSON files to PostgreSQL database
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create a new pool using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

async function importData() {
  console.log('Importing data into PostgreSQL database...');
  
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Read the exported data from JSON files
    const dataDir = path.join(process.cwd(), 'data');
    
    console.log('Reading exported data files...');
    
    const usersData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8')
    );
    
    const tasksData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'tasks.json'), 'utf-8')
    );
    
    const columnsData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'columns.json'), 'utf-8')
    );
    
    console.log(`Found: ${usersData.length} users, ${tasksData.length} tasks, ${columnsData.length} columns`);
    
    // Check if columns already exist
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
    
    // Check if users already exist
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
    
    // Check if tasks already exist
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
    
    console.log('Data import complete!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    if (client) {
      client.release();
    }
    
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the import
importData().then(() => {
  console.log('Import script completed');
  process.exit(0);
}).catch(err => {
  console.error('Import script failed:', err);
  process.exit(1);
}); 