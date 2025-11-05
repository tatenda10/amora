const pool = require('../db/connection');

/**
 * Check which companions don't have profile pictures
 */

async function checkCompanionImages() {
  try {
    console.log('🔍 Checking companion profile pictures...\n');
    
    // Get companions without profile pictures
    const [companionsWithoutPics] = await pool.execute(`
      SELECT 
        id,
        name,
        age,
        gender,
        country,
        profile_image_url,
        created_at
      FROM companions 
      WHERE profile_image_url IS NULL 
         OR profile_image_url = '' 
         OR profile_image_url = 'null'
      ORDER BY id
    `);
    
    // Get total count
    const [totalCount] = await pool.execute('SELECT COUNT(*) as total FROM companions');
    const [withPicsCount] = await pool.execute(`
      SELECT COUNT(*) as with_pics 
      FROM companions 
      WHERE profile_image_url IS NOT NULL 
        AND profile_image_url != '' 
        AND profile_image_url != 'null'
    `);
    
    console.log('📊 Summary:');
    console.log(`   Total companions: ${totalCount[0].total}`);
    console.log(`   With profile pictures: ${withPicsCount[0].with_pics}`);
    console.log(`   Without profile pictures: ${companionsWithoutPics.length}\n`);
    
    if (companionsWithoutPics.length > 0) {
      console.log('❌ Companions without profile pictures:');
      companionsWithoutPics.forEach(companion => {
        console.log(`   ID: ${companion.id} | Name: ${companion.name} | Age: ${companion.age} | Country: ${companion.country}`);
      });
    } else {
      console.log('✅ All companions have profile pictures!');
    }
    
    // Show companions with pictures for comparison
    const [companionsWithPics] = await pool.execute(`
      SELECT id, name, profile_image_url
      FROM companions 
      WHERE profile_image_url IS NOT NULL 
        AND profile_image_url != '' 
        AND profile_image_url != 'null'
      ORDER BY id
      LIMIT 5
    `);
    
    if (companionsWithPics.length > 0) {
      console.log('\n✅ Sample companions with profile pictures:');
      companionsWithPics.forEach(companion => {
        console.log(`   ID: ${companion.id} | Name: ${companion.name} | Image: ${companion.profile_image_url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking companion images:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkCompanionImages()
    .then(() => {
      console.log('\n✨ Companion image check completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to check companion images:', error);
      process.exit(1);
    });
}

module.exports = { checkCompanionImages };

