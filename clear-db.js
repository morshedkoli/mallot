const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let uri = 'mongodb://localhost:27017/qurbani_tracker';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match && match[1]) {
    uri = match[1].trim();
  }
}

console.log('Connecting to MongoDB database to purge mock data...');

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to database! Clearing beneficiaries collection...');
    const db = mongoose.connection.db;
    
    // Clear the beneficiaries collection
    await db.collection('beneficiaries').deleteMany({});
    console.log('SUCCESS: All database mock records have been successfully purged!');
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR connecting to or clearing database:', err);
    process.exit(1);
  });
