const { runMigrations } = require('./index');

// Run migrations
runMigrations()
  .then(() => {
    console.log('✅ Migrations completed');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 