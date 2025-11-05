require('dotenv').config({ path: '../.env' });
const pool = require('../db/connection');
const fs = require('fs').promises;
const path = require('path');

async function seedCompanions() {
  try {
    console.log('Starting database seeding...');
    
    // Check if companions table exists
    const [tables] = await pool.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'companions'",
      [process.env.DB_NAME || 'amora_db']
    );
    
    if (tables.length === 0) {
      console.log('Companions table does not exist! Creating table...');
      
      // Read schema.sql file
      const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
      const schemaSql = await fs.readFile(schemaPath, 'utf8');
      
      // Execute schema SQL
      const statements = schemaSql.split(';').filter(stmt => stmt.trim());
      for (const stmt of statements) {
        await pool.execute(stmt);
      }
      
      console.log('Database schema created successfully!');
    }
    
    // Check if companions already exist
    const [existingCompanions] = await pool.execute('SELECT COUNT(*) as count FROM companions');
    if (existingCompanions[0].count > 0) {
      console.log(`Database already has ${existingCompanions[0].count} companions.`);
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        console.log('Use --force flag to clear existing data and reseed.');
        process.exit(0);
      }
      
      console.log('Clearing existing companions data...');
      await pool.execute('DELETE FROM companions');
      console.log('Existing companions data cleared.');
    }
    
    // Read companions data from JSON file
    const dataPath = path.join(__dirname, '..', 'controllers', 'companions', 'data', 'companions_with_ethnicity_and_country.json');
    const jsonData = await fs.readFile(dataPath, 'utf8');
    const { companions } = JSON.parse(jsonData);
    
    console.log(`Found ${companions.length} companions in JSON file.`);
    
    // Insert companions into database
    let successCount = 0;
    let errorCount = 0;
    
    for (const companion of companions) {
      try {
        await pool.execute(
          `INSERT INTO companions (
            id, name, age, gender, country, ethnicity, personality, 
            traits, interests, backstory
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            companion.id,
            companion.name,
            companion.age || null,
            companion.gender,
            companion.country || null,
            companion.ethnicity || null,
            companion.personality,
            JSON.stringify(companion.traits),
            JSON.stringify(companion.interests),
            companion.backstory
          ]
        );
        successCount++;
      } catch (error) {
        console.error(`Error inserting companion ${companion.id} (${companion.name}):`, error.message);
        errorCount++;
      }
    }
    
    console.log('Database seeding completed!');
    console.log(`Successfully inserted: ${successCount} companions`);
    console.log(`Failed to insert: ${errorCount} companions`);
    
    // Verify seeding
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM companions');
    console.log(`Total companions in database after seeding: ${countResult[0].count}`);
    
    // Check for companions matching the user's preferences from the original request
    console.log('\nChecking for companions matching user preferences...');
    const [matchingCompanions] = await pool.execute(
      'SELECT id, name, gender, country, ethnicity FROM companions WHERE gender = ? AND country = ?',
      ['Male', 'United States']
    );
    
    console.log(`Found ${matchingCompanions.length} male companions from United States`);
    if (matchingCompanions.length > 0) {
      console.log('Sample matching companions:');
      matchingCompanions.slice(0, 5).forEach(companion => {
        console.log(`- ${companion.name} (ID: ${companion.id}, Gender: ${companion.gender}, Country: ${companion.country}, Ethnicity: ${companion.ethnicity})`);
      });
    }
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection pool
    process.exit(0);
  }
}

seedCompanions();