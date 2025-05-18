// Script to import data from JSON files to PostgreSQL database
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { db } from '../db';
import { columns, tasks, users } from '../db/schema';

// Load environment variables
dotenv.config();

async function importData() {
  console.log('Importing data into PostgreSQL database...');
  
  try {
    // Check if database connection is valid
    console.log('Testing database connection...');
    const testUsers = await db.query.users.findMany({ limit: 1 });
    console.log('Database connection successful');
    
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
    
    // Import data - columns first, then users, then tasks (due to foreign key relationships)
    console.log('Importing columns...');
    
    // Make sure we don't have duplicates
    const existingColumns = await db.query.columns.findMany();
    if (existingColumns.length > 0) {
      console.log('Columns already exist in the database. Skipping column import.');
    } else {
      // Import columns
      for (const column of columnsData) {
        await db.insert(columns).values({
          id: column.id,
          name: column.name,
          order: column.order
        });
      }
      console.log(`Imported ${columnsData.length} columns`);
    }
    
    // Import users
    console.log('Importing users...');
    const existingUsers = await db.query.users.findMany();
    if (existingUsers.length > 0) {
      console.log('Users already exist in the database. Skipping user import.');
    } else {
      for (const user of usersData) {
        await db.insert(users).values({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        });
      }
      console.log(`Imported ${usersData.length} users`);
    }
    
    // Import tasks
    console.log('Importing tasks...');
    const existingTasks = await db.query.tasks.findMany();
    if (existingTasks.length > 0) {
      console.log('Tasks already exist in the database. Skipping task import.');
    } else {
      for (const task of tasksData) {
        await db.insert(tasks).values({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          assigneeId: task.assignee_id,
          columnId: task.column_id,
          order: task.order
        });
      }
      console.log(`Imported ${tasksData.length} tasks`);
    }
    
    console.log('Data import complete!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the import
importData(); 