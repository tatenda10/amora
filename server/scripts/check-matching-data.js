require('dotenv').config();
const pool = require('../db/connection');

async function checkMatchingData() {
  try {
    console.log('=== CHECKING MATCHING CONTROLLER DATA ===');
    
    // Check for companions without descriptions
    const [noDescription] = await pool.execute('SELECT id, name, backstory FROM companions WHERE backstory IS NULL OR backstory = ""');
    console.log('Companions without descriptions:', noDescription.length);
    noDescription.forEach(comp => console.log('- ' + comp.name + ' (ID: ' + comp.id + ')'));
    
    // Check for companions without images
    const [noImages] = await pool.execute('SELECT id, name, profile_image_url FROM companions WHERE profile_image_url IS NULL OR profile_image_url = ""');
    console.log('\nCompanions without images:', noImages.length);
    noImages.forEach(comp => console.log('- ' + comp.name + ' (ID: ' + comp.id + ')'));
    
    // Check for duplicate names
    const [duplicates] = await pool.execute('SELECT name, COUNT(*) as count FROM companions GROUP BY name HAVING COUNT(*) > 1');
    console.log('\nDuplicate names found:', duplicates.length);
    duplicates.forEach(dup => console.log('- ' + dup.name + ': ' + dup.count + ' times'));
    
    // Check total companions
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM companions');
    console.log('\nTotal companions:', total[0].count);
    
    // Sample companions with full data
    const [sample] = await pool.execute('SELECT id, name, gender, backstory, profile_image_url FROM companions LIMIT 10');
    console.log('\nSample companions:');
    sample.forEach(comp => {
      console.log('ID: ' + comp.id + ', Name: ' + comp.name + ', Gender: ' + comp.gender);
      console.log('Has description: ' + (comp.backstory ? 'YES' : 'NO'));
      console.log('Has image: ' + (comp.profile_image_url ? 'YES' : 'NO'));
      console.log('---');
    });
    
    // Check what the matching controller would return
    console.log('\n=== SIMULATING MATCHING CONTROLLER ===');
    
    // Get a sample user profile (simulate what would be passed to matching)
    const [userProfile] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.profile_image_url,
        up.country, up.sex, up.age, up.interests, 
        up.looking_for, up.preferences, up.onboarding_completed
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = 1
    `);
    
    if (userProfile.length > 0) {
      const user = userProfile[0];
      console.log('Sample user profile:', {
        name: user.name,
        country: user.country,
        sex: user.sex,
        age: user.age,
        looking_for: user.looking_for,
        preferences: user.preferences
      });
      
      // Get all companions
      const [companions] = await pool.execute('SELECT * FROM companions ORDER BY created_at DESC');
      console.log('Total companions available:', companions.length);
      
      // Check companions by gender
      const [femaleCompanions] = await pool.execute('SELECT COUNT(*) as count FROM companions WHERE gender = "Female"');
      const [maleCompanions] = await pool.execute('SELECT COUNT(*) as count FROM companions WHERE gender = "Male"');
      const [nonBinaryCompanions] = await pool.execute('SELECT COUNT(*) as count FROM companions WHERE gender = "Non-binary"');
      
      console.log('Gender distribution:');
      console.log('- Female:', femaleCompanions[0].count);
      console.log('- Male:', maleCompanions[0].count);
      console.log('- Non-binary:', nonBinaryCompanions[0].count);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMatchingData();
