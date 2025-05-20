const fs = require('fs');
const { Client } = require('pg');

const PG_URL = 'postgresql://kanban_postgres_cl8h_user:WmoTDvRlNEwiHVPjTmQkKzP5FSAMQCJV@dpg-d0kvu8t6ubrc73blpb00-a.frankfurt-postgres.render.com/kanban_postgres_cl8h';
const TASKS_PATH = './data/tasks.json';

async function main() {
  const pgClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  // Load users and columns from PG
  const usersRes = await pgClient.query('SELECT id, name, email FROM users');
  const columnsRes = await pgClient.query('SELECT id, name, "order" FROM columns');
  const users = usersRes.rows;
  const columns = columnsRes.rows;

  // Load tasks from JSON
  const tasks = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
  let inserted = 0;
  for (const task of tasks) {
    // Map assignee_id by round-robin or by name/email if you have that info
    let assignee = users.find(u => u.id === task.assignee_id);
    if (!assignee) assignee = users[task.assignee_id % users.length]; // fallback: round-robin
    if (!assignee) {
      console.log(`No assignee found for task ${task.title}, skipping.`);
      continue;
    }
    // Map column_id by order (since names and order are unique)
    let column = columns.find(c => c.id === task.column_id) || columns[task.column_id % columns.length];
    if (!column) {
      console.log(`No column found for task ${task.title}, skipping.`);
      continue;
    }
    try {
      await pgClient.query(
        `INSERT INTO tasks (title, description, status, assignee_id, column_id, "order", created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          task.title,
          task.description,
          task.status,
          assignee.id,
          column.id,
          task.order,
          task.created_at,
          task.updated_at || task.created_at
        ]
      );
      inserted++;
      console.log(`Inserted task: ${task.title}`);
    } catch (e) {
      console.log(`Failed to insert task ${task.title}:`, e.message);
    }
  }
  console.log(`Inserted ${inserted} tasks.`);
  await pgClient.end();
}

main().catch(e => { console.error(e); process.exit(1); }); 