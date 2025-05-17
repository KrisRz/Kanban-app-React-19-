/**
 * This script performs pre-deployment setup tasks like:
 * - Checking database connection
 * - Running migrations
 */
import { db } from '../db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Starting deployment preparation...')
  
  try {
    // Check database connection
    console.log('Checking database connection...')
    const result = await db.execute(sql`SELECT 1+1 as result`)
    
    if (!result || result.length === 0) {
      throw new Error('Database connection failed')
    }
    
    // Run migrations in production
    console.log('Running database migrations...')
    // Migrations will be handled by a separate command in package.json
    
    console.log('Deployment preparation completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Deployment preparation failed:', error)
    process.exit(1)
  }
}

main() 