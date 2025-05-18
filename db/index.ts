import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import { drizzle as drizzleMySQL } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// For use in a Node.js environment
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kanban';

// Determine if we should use SSL based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Determine if we're using MySQL (for the free database) or Postgres (local)
const isMySQL = connectionString.includes('mysql://');

// Database client and connection
let db: any;

if (process.env.SKIP_DB_CONNECT === 'true') {
  // More comprehensive mock implementation
  const mockQueryResult: any[] = [];
  
  // Create a complete mock DB object
  db = {
    select: () => ({
      from: () => mockQueryResult,
      where: () => mockQueryResult,
      orderBy: () => mockQueryResult
    }),
    query: {
      users: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
      },
      columns: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
      },
      tasks: {
        findMany: () => Promise.resolve([]),
        findFirst: () => Promise.resolve(null),
      }
    },
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([])
        })
      })
    }),
    delete: () => ({
      where: () => Promise.resolve([])
    })
  };
} else {
  if (isMySQL) {
    // MySQL connection for freesqldatabase.com
    try {
      // Extract connection details from the connection string
      const connectionDetails = connectionString.replace('mysql://', '').split('@');
      const [userPass, hostPort] = connectionDetails;
      const [user, password] = userPass.split(':');
      const [host, portDb] = hostPort.split(':');
      const [port, database] = portDb ? portDb.split('/') : ['3306', hostPort.split('/')[1]];
      
      console.log(`Connecting to MySQL database: ${database} on host: ${host}`);
      
      let connectionSuccessful = true;
      let connectionPool: mysql.Pool | null = null;
      
      // Function to set up mock DB - moved outside the block to fix linter error
      const setupMockDB = () => {
        console.log('Using mock database in production as fallback');
        const mockQueryResult: any[] = [];
        
        // Create a mock DB object that returns empty results instead of failing
        return {
          select: () => ({
            from: () => mockQueryResult,
            where: () => mockQueryResult,
            orderBy: () => mockQueryResult
          }),
          query: {
            users: {
              findMany: () => Promise.resolve([]),
              findFirst: () => Promise.resolve(null),
            },
            columns: {
              findMany: () => Promise.resolve([]),
              findFirst: () => Promise.resolve(null),
            },
            tasks: {
              findMany: () => Promise.resolve([]),
              findFirst: () => Promise.resolve(null),
            }
          },
          insert: () => ({
            values: () => ({
              returning: () => Promise.resolve([])
            })
          }),
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => Promise.resolve([])
              })
            })
          }),
          delete: () => ({
            where: () => Promise.resolve([])
          })
        };
      };

      try {
        connectionPool = mysql.createPool({
          host,
          user,
          password,
          database,
          port: Number(port),
          ssl: undefined, // Disable SSL
          connectTimeout: 30000, // Increased timeout
          connectionLimit: 1, // Minimum connection limit to prevent host blocks
          waitForConnections: true,
          queueLimit: 5, // Limit queue size
          enableKeepAlive: false, // Disable keep-alive in production to prevent blocked hosts
          trace: false, // Disable trace to reduce connection overhead
          multipleStatements: false, // Disable multiple statements to reduce risk
          dateStrings: true, // Return date as strings to avoid timezone issues
        });
        
        // Create drizzle MySQL instance with the mode parameter
        db = drizzleMySQL(connectionPool, { schema, mode: 'default' });
        
        // Test the connection with retry logic - but only once in production
        console.log('Testing MySQL connection...');
        const testConnection = async (attempt = 1, maxAttempts = isProduction ? 1 : 3) => {
          try {
            if (!connectionPool) throw new Error('Connection pool is null');
            await connectionPool.query('SELECT 1');
            console.log('MySQL connection successful');
            return true;
          } catch (err) {
            console.error(`MySQL connection test failed (attempt ${attempt}/${maxAttempts}):`, err);
            
            if (attempt < maxAttempts) {
              const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10 seconds
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return testConnection(attempt + 1, maxAttempts);
            }
            
            return false;
          }
        };
        
        // Test connection - if it fails and we're in production, fall back to mock DB
        // In production, only try once to avoid getting blocked
        testConnection().then(success => {
          if (!success && isProduction) {
            connectionSuccessful = false;
            console.log('Creating fallback mock DB for production environment to keep app running...');
            db = setupMockDB();
          }
        }).catch(error => {
          console.error('Connection test failed:', error);
          if (isProduction) {
            connectionSuccessful = false;
            db = setupMockDB();
          }
        });
      } catch (error) {
        console.error('MySQL connection error:', error);
        if (isProduction) {
          console.log('Creating fallback mock DB for production environment to keep app running...');
          connectionSuccessful = false;
          db = setupMockDB();
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error setting up MySQL connection:', error);
      throw error;
    }
  } else {
    // Postgres connection for local development
    // Connection options
    const connectionOptions = {
      max: 1,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    };

    // Connection pool for direct queries
    const queryClient = postgres(connectionString, connectionOptions);

    // Create drizzle instance
    db = drizzle(queryClient, { schema });
  }
}

export { db };

// Migration function
export async function runMigrations() {
  console.log('Running migrations...');
  
  if (process.env.SKIP_DB_CONNECT === 'true') {
    console.log('Skipping migrations due to SKIP_DB_CONNECT');
    return;
  }
  
  if (isMySQL) {
    console.log('MySQL migrations are not supported through this function. Please use db:push instead.');
    return;
  }
  
  try {
    const migrationClient = postgres(connectionString, {
      max: 1,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    
    await migrate(drizzle(migrationClient), {
      migrationsFolder: './db/migrations',
    });
    
    console.log('Migrations completed successfully');
    await migrationClient.end();
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
} 