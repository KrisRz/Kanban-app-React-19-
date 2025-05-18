// This script will be triggered during the first startup of the app
// It will import data from the JSON files into the PostgreSQL database

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const IMPORT_FLAG_FILE = path.join(process.cwd(), '.import_completed');

// Check if import has already been done
if (fs.existsSync(IMPORT_FLAG_FILE)) {
  console.log('Data already imported. Skipping import.');
  process.exit(0);
}

// Run the import process
console.log('Starting data import on first startup...');

// Execute the import script
exec('npx ts-node -T scripts/import-data.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Import error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Import stderr: ${stderr}`);
  }
  
  console.log(`Import stdout: ${stdout}`);
  
  // Create a flag file to indicate import was completed
  fs.writeFileSync(IMPORT_FLAG_FILE, new Date().toISOString());
  console.log('Import completed. Created flag file.');
}); 