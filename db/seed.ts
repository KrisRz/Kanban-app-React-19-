const { db } = require('./index');
const { columns, tasks, users, statusEnum } = require('./schema');
const fs = require('fs');
const path = require('path');

// Define the TeamMember interface
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

// Read team members from file because we can't require from '../data' directly in CommonJS
const teamMembersPath = path.join(__dirname, '..', 'data', 'team-members.ts');
const teamMembersFile = fs.readFileSync(teamMembersPath, 'utf8');
// Extract the array part with a regex
const teamMembersMatch = teamMembersFile.match(/export const teamMembers = (\[[\s\S]*?\]);/);
// Evaluate the array
const teamMembers = eval(teamMembersMatch[1]);

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data
    await db.delete(tasks);
    await db.delete(columns);
    await db.delete(users);

    console.log('Cleared existing data');

    // Seed users/team members
    const insertedUsers = await db.insert(users).values(
      teamMembers.map((member: TeamMember) => ({
        name: member.name,
        email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        role: member.role,
        avatar: member.avatar
      }))
    ).returning();

    console.log(`Inserted ${insertedUsers.length} users`);

    // Seed columns
    const insertedColumns = await db.insert(columns).values([
      { name: 'To Do', order: 1 },
      { name: 'In Progress', order: 2 },
      { name: 'Done', order: 3 }
    ]).returning();

    console.log(`Inserted ${insertedColumns.length} columns`);

    // Seed tasks
    const taskData = [
      {
        title: 'Design Homepage',
        description: 'Create new homepage design with modern look and feel',
        status: 'todo',
        assigneeId: insertedUsers[0].id.toString(),
        columnId: insertedColumns[0].id,
        order: 1
      },
      {
        title: 'Implement Auth',
        description: 'Add authentication system with social login options',
        status: 'in-progress',
        assigneeId: insertedUsers[1].id.toString(),
        columnId: insertedColumns[1].id,
        order: 1
      },
      {
        title: 'Setup Database',
        description: 'Configure database connection and create initial schemas',
        status: 'done',
        columnId: insertedColumns[2].id,
        order: 1
      },
      {
        title: 'API Documentation',
        description: 'Write comprehensive documentation for all API endpoints',
        status: 'todo',
        assigneeId: insertedUsers[2].id.toString(),
        columnId: insertedColumns[0].id,
        order: 2
      },
      {
        title: 'Unit Testing',
        description: 'Add unit tests for core functionality to ensure code quality',
        status: 'in-progress',
        columnId: insertedColumns[1].id,
        order: 2
      }
    ];

    const insertedTasks = await db.insert(tasks).values(taskData).returning();

    console.log(`Inserted ${insertedTasks.length} tasks`);
    console.log('✅ Seed completed successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed(); 