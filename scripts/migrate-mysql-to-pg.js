const mysql = require('mysql2/promise');
const { Client } = require('pg');

const MYSQL_URL = 'mysql://sql8779451:M8hGX38u74@sql8.freesqldatabase.com:3306/sql8779451'; // old MySQL
const PG_URL = 'postgresql://kanban_postgres_cl8h_user:WmoTDvRlNEwiHVPjTmQkKzP5FSAMQCJV@dpg-d0kvu8t6ubrc73blpb00-a.frankfurt-postgres.render.com/kanban_postgres_cl8h'; // Render external PostgreSQL

async function migrate() {
  // Connect to MySQL
  const mysqlConn = await mysql.createConnection(MYSQL_URL);

  // Connect to PostgreSQL
  const pgClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  // --- USERS ---
  const [users] = await mysqlConn.query('SELECT * FROM users');
  let userCount = 0;
  for (const user of users) {
    await pgClient.query(
      `INSERT INTO users (name, email, role, avatar, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [user.name, user.email, user.role, user.avatar, user.created_at, user.updated_at]
    );
    userCount++;
  }
  console.log(`Migrated ${userCount} users`);

  // --- TASKS ---
  const [tasks] = await mysqlConn.query('SELECT * FROM tasks');
  let taskCount = 0;
  for (const task of tasks) {
    await pgClient.query(
      `INSERT INTO tasks (title, description, status, assignee_id, column_id, "order", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [
        task.title,
        task.description,
        task.status,
        task.assignee_id,
        task.column_id,
        task.order,
        task.created_at,
        task.updated_at
      ]
    );
    taskCount++;
  }
  console.log(`Migrated ${taskCount} tasks`);

  await mysqlConn.end();
  await pgClient.end();
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
}); 