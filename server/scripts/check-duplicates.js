require('dotenv').config();
const pool = require('../db/connection');

async function checkDuplicates() {
  try {
    console.log('Checking for duplicates and missing data...\n');
    
    // Check for duplicate names
    const [duplicates] = await pool.execute('SELECT name, COUNT(*) as count FROM companions GROUP BY name HAVING COUNT(*) > 1');
    console.log('Duplicate names found:', duplicates.length);
    duplicates.forEach(dup => console.log(`- ${dup.name}: ${dup.count} times`));
    
    // Check for companions without descriptions
    const [noDescription] = await pool.execute('SELECT id, name FROM companions WHERE backstory IS NULL OR backstory = ""');
    console.log('\nCompanions without descriptions:', noDescription.length);
    noDescription.forEach(comp => console.log(`- ${comp.name} (ID: ${comp.id})`));
    
    // Check for companions without images
    const [noImages] = await pool.execute('SELECT id, name FROM companions WHERE profile_image_url IS NULL OR profile_image_url = ""');
    console.log('\nCompanions without images:', noImages.length);
    noImages.forEach(comp => console.log(`- ${comp.name} (ID: ${comp.id})`));
    
    // Show total count
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM companions');
    console.log(`\nTotal companions: ${total[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDuplicates();
