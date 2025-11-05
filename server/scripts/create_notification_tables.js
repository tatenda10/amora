const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createNotificationTables() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'amora_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read the notification schema SQL file
    const schemaPath = path.join(__dirname, '../db/notification_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Creating notification tables...');

    // Split SQL by semicolons and execute each statement
    const statements = schemaSQL.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed.length > 0) {
        try {
          await connection.query(trimmed);
        } catch (err) {
          // Ignore "table already exists" errors
          if (err.code !== 'ER_TABLE_EXISTS_ERROR' && !err.message.includes('already exists')) {
            console.warn('⚠️  Warning executing statement:', err.message);
          }
        }
      }
    }

    console.log('✅ Successfully created notification tables:');
    console.log('   - user_push_tokens');
    console.log('   - user_notification_settings');
    console.log('   - notification_history');

    // Verify tables were created
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('user_push_tokens', 'user_notification_settings', 'notification_history')",
      [process.env.DB_NAME || 'amora_db']
    );

    console.log('\n📊 Verified tables:');
    tables.forEach(table => {
      console.log(`   ✅ ${table.TABLE_NAME}`);
    });

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error creating notification tables:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('   This might be a foreign key constraint issue. Make sure the users table exists.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
createNotificationTables();

