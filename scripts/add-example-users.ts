// Script to add example users to the database
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection string
const dbUrl = process.env.DATABASE_URL || 'mysql://sql8779451:M8hGX38u74@sql8.freesqldatabase.com:3306/sql8779451';

// Example users to add
const exampleUsers = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Designer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Alex Chen",
    email: "alex.chen@example.com",
    role: "Developer",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg"
  },
  {
    name: "Raj Patel",
    email: "raj.patel@example.com",
    role: "QA Analyst",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg"
  },
  {
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    role: "Marketing",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg"
  }
];

async function addExampleUsers() {
  console.log('Adding example users to the database...');
  
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbUrl);
    
    console.log('Connected to database.');
    
    for (const userData of exampleUsers) {
      try {
        // Check if user already exists
        const [existingUsers] = await connection.execute(
          'SELECT * FROM users WHERE email = ?',
          [userData.email]
        );
        
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
          console.log(`User with email ${userData.email} already exists. Skipping.`);
          continue;
        }
        
        // Insert the user
        await connection.execute(
          'INSERT INTO users (name, email, role, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [userData.name, userData.email, userData.role, userData.avatar]
        );
        
        console.log(`Added user: ${userData.name} (${userData.email})`);
      } catch (error) {
        console.error(`Error adding user ${userData.name}:`, error);
      }
    }
    
    console.log('Finished adding example users!');
  } catch (error) {
    console.error('Error in add-example-users script:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
    process.exit(0);
  }
}

// Run the function
addExampleUsers(); 