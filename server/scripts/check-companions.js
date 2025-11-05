require('dotenv').config({ path: '../.env' });
const pool = require('../db/connection');

async function checkCompanions() {
  try {
    console.log('Checking companions in database...');
    
    // Check if companions table exists
    const [tables] = await pool.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'companions'",
      [process.env.DB_NAME || 'amora_db']
    );
    
    if (tables.length === 0) {
      console.log('Companions table does not exist!');
      return;
    }
    
    // Count companions
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM companions');
    console.log(`Total companions in database: ${countResult[0].count}`);
    
    if (countResult[0].count > 0) {
      // Get sample companions
      const [companions] = await pool.execute('SELECT id, name, gender, country, ethnicity, personality, traits, interests FROM companions LIMIT 5');
      console.log('Sample companions:');
      companions.forEach(companion => {
        console.log('-----------------------------------');
        console.log(`ID: ${companion.id}`);
        console.log(`Name: ${companion.name}`);
        console.log(`Gender: ${companion.gender}`);
        console.log(`Country: ${companion.country}`);
        console.log(`Ethnicity: ${companion.ethnicity}`);
        console.log(`Personality: ${companion.personality}`);
        console.log(`Traits: ${companion.traits}`);
        console.log(`Interests: ${companion.interests}`);
      });
    }
    
    // Check for companions matching the user's preferences
    console.log('\nChecking for companions matching user preferences...');
    const [matchingCompanions] = await pool.execute(
      'SELECT id, name, gender, country, ethnicity FROM companions WHERE gender = ? AND country = ?',
      ['Male', 'United States']
    );
    
    console.log(`Found ${matchingCompanions.length} male companions from United States`);
    if (matchingCompanions.length > 0) {
      console.log('Sample matching companions:');
      matchingCompanions.slice(0, 3).forEach(companion => {
        console.log(`- ${companion.name} (ID: ${companion.id}, Gender: ${companion.gender}, Country: ${companion.country}, Ethnicity: ${companion.ethnicity})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking companions:', error);
  } finally {
    // Close the connection pool
    process.exit(0);
  }
}

checkCompanions();