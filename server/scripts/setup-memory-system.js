const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMemorySchemaMigration() {
  let connection;
  
  try {
    console.log('=== MEMORY SCHEMA MIGRATION START ===');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'amora_db',
    });
    
    console.log('Connected to database');
    
    // Read the memory schema file
    const schemaPath = path.join(__dirname, '..', 'db', 'memory_schema_simple.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Read memory schema file');
    console.log('Schema content length:', schemaSQL.length);
    console.log('First 200 chars:', schemaSQL.substring(0, 200));
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // Remove comments and empty statements
        const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
        return cleanStmt.length > 0 && cleanStmt.toUpperCase().startsWith('CREATE');
      });
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    console.log('First statement:', statements[0]?.substring(0, 100));
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Table already exists for statement ${i + 1}, skipping...`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('=== MEMORY SCHEMA MIGRATION COMPLETED SUCCESSFULLY ===');
    
    // Verify tables were created
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN (
        'companion_memories',
        'user_emotional_states', 
        'relationship_progression',
        'conversation_contexts',
        'companion_personality_evolution',
        'proactive_engagements',
        'daily_interaction_summaries'
      )
    `, [process.env.DB_NAME || 'amora_db']);
    
    console.log('Created tables:', tables.map(t => t.TABLE_NAME));
    
  } catch (error) {
    console.error('=== MEMORY SCHEMA MIGRATION FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
runMemorySchemaMigration();
