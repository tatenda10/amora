const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMultiLanguageMigration() {
  let connection;
  
  try {
    // Create database connection using same config as the app
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('Connected to database successfully');
    console.log(`Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);

    // Read the multi-language schema
    const schemaPath = path.join(__dirname, '..', 'db', 'multi_language_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await connection.execute(schema);
    
    console.log('✅ Multi-language schema created successfully!');
    console.log('📊 New table created:');
    console.log('   - user_language_preferences (language detection and storage)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Make sure your .env file has the correct database credentials:');
    console.error('DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
runMultiLanguageMigration();
