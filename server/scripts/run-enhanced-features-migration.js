const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
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

    // Read the enhanced features schema
    const schemaPath = path.join(__dirname, '..', 'db', 'enhanced_features_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    // Remove comments and split by semicolon, then filter for CREATE TABLE statements
    const cleanSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && stmt.toUpperCase().includes('CREATE TABLE'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        console.log(`Statement: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Enhanced features schema created successfully!');
    console.log('📊 New tables created:');
    console.log('   - conversation_topics (topic threading)');
    console.log('   - user_communication_styles (style learning)');
    console.log('   - user_cultural_context (cultural adaptation)');
    console.log('   - conversation_flow_metrics (flow tracking)');
    console.log('   - topic_transitions (transition handling)');
    console.log('   - user_preference_learning (preference learning)');

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
runMigration();
