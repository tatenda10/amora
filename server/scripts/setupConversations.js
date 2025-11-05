require('dotenv').config();
const pool = require('../db/connection');
const fs = require('fs').promises;
const path = require('path');

async function setupConversations() {
  try {
    console.log('Setting up conversations database tables...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../db/conversations_schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.execute(statement);
      }
    }

    console.log('✅ Conversations database tables created successfully!');
    console.log('\nCreated tables:');
    console.log('- conversations');
    console.log('- messages');
    console.log('- notifications');
    console.log('- companion_selections');

  } catch (error) {
    console.error('❌ Error setting up conversations database:', error);
  } finally {
    await pool.end();
  }
}

setupConversations(); 