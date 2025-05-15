import { db } from './index';
import { columns, tasks, users } from './schema';
import { eq } from 'drizzle-orm';

// Team members data
const teamMembers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Designer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Product Manager',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
  }
];

// Column data
const columnData = [
  { id: 1, name: 'To Do', order: 1 },
  { id: 2, name: 'In Progress', order: 2 },
  { id: 3, name: 'Done', order: 3 }
];

// Task data with properly typed status values
const taskData = [
  {
    id: 1,
    title: 'Set up project',
    description: 'Initialize the repository and set up the basic structure',
    status: 'done' as const,
    assigneeId: 1,
    columnId: 3,
    order: 1
  },
  {
    id: 2,
    title: 'Create database schema',
    description: 'Design and implement the database schema for the application',
    status: 'in-progress' as const,
    assigneeId: 1,
    columnId: 2,
    order: 1
  },
  {
    id: 3,
    title: 'Design UI mockups',
    description: 'Create mockups for the main application screens',
    status: 'done' as const,
    assigneeId: 2,
    columnId: 3,
    order: 2
  },
  {
    id: 4,
    title: 'Implement authentication',
    description: 'Add user authentication and authorization',
    status: 'todo' as const,
    assigneeId: 1,
    columnId: 1,
    order: 1
  },
  {
    id: 5,
    title: 'Create API endpoints',
    description: 'Implement the necessary API endpoints for the frontend',
    status: 'todo' as const,
    assigneeId: 3,
    columnId: 1,
    order: 2
  }
];

async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(tasks);
    await db.delete(users);
    await db.delete(columns);
    
    // Insert users
    console.log('Inserting users...');
    await db.insert(users).values(teamMembers);
    
    // Insert columns
    console.log('Inserting columns...');
    await db.insert(columns).values(columnData);
    
    // Insert tasks
    console.log('Inserting tasks...');
    await db.insert(tasks).values(taskData);
    
    console.log('✅ Seeding completed successfully!');
    console.log(`Inserted ${teamMembers.length} users`);
    console.log(`Inserted ${columnData.length} columns`);
    console.log(`Inserted ${taskData.length} tasks`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed(); 