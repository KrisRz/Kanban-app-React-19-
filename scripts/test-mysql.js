const mysql = require('mysql2/promise');

async function testConnection() {
  const connectionString = process.env.DATABASE_URL?.trim() || 'mysql://sql8779451:M8hGX38u74@sql8.freesqldatabase.com:3306/sql8779451';
  
  try {
    // Extract connection details from the connection string
    const connectionDetails = connectionString.replace('mysql://', '').split('@');
    const [userPass, hostPort] = connectionDetails;
    const [user, password] = userPass.split(':');
    const [host, portDb] = hostPort.split(':');
    const [port, dbWithSpaces] = portDb ? portDb.split('/') : ['3306', hostPort.split('/')[1]];
    const database = dbWithSpaces.trim(); // Remove any trailing spaces
    
    console.log(`Connecting to MySQL database: "${database}" on host: ${host}`);
    
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port: Number(port),
      ssl: undefined,
      connectTimeout: 30000
    });
    
    console.log('Connection established successfully');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Query result:', rows);
    
    // Show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('MySQL connection error:', error);
  }
}

testConnection(); 