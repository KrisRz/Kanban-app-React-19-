import { db } from '../db';
import { columns, tasks, users } from '../db/schema';

async function checkDatabase() {
  try {
    console.log('Checking database contents...');
    
    // Check users
    const allUsers = await db.query.users.findMany();
    console.log(`\nUsers (${allUsers.length}):`);
    console.table(allUsers);
    
    // Check columns
    const allColumns = await db.query.columns.findMany();
    console.log(`\nColumns (${allColumns.length}):`);
    console.table(allColumns);
    
    // Check tasks (without relations to avoid type issues)
    const allTasks = await db.select().from(tasks);
    console.log(`\nTasks (${allTasks.length}):`);
    console.table(allTasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      assigneeId: task.assigneeId,
      columnId: task.columnId
    })));
    
    // Check tasks with full details
    console.log('\nTasks (full details):');
    allTasks.forEach(task => {
      console.log(JSON.stringify(task, null, 2));
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase(); 