const pool = require('../db/connection');
const ImageGenerationService = require('../services/imageGenerationService');

/**
 * Generate profile pictures for the remaining companions that hit billing limit
 */

async function generateRemainingImages() {
  try {
    console.log('🎨 Generating Images for Remaining Companions\n');

    const imageService = new ImageGenerationService();

    // Get the specific companions that failed
    const [companions] = await pool.execute(`
      SELECT 
        id, name, age, gender, country, ethnicity, personality
      FROM companions 
      WHERE id IN (66, 67, 68, 69)
      ORDER BY id
    `);

    if (companions.length === 0) {
      console.log('✅ All companions already have profile pictures!');
      return;
    }

    console.log(`🎯 Generating images for ${companions.length} remaining companions:`);
    companions.forEach(c => {
      console.log(`   - ${c.name} (${c.age} years, ${c.gender}, ${c.country})`);
    });
    console.log();

    // Generate images with longer delay to respect API limits
    const results = await imageService.generateBatchProfilePictures(companions, 5000);

    // Show results
    console.log('\n📊 Results:');
    const stats = imageService.getGenerationStats(results);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Successful: ${stats.successful}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`   Success Rate: ${stats.successRate}`);

    // Update database with successful results
    let updatedCount = 0;
    for (const result of results) {
      if (result.success) {
        try {
          await pool.execute(
            'UPDATE companions SET profile_image_url = ? WHERE id = ?',
            [result.url, result.companionId]
          );
          updatedCount++;
          console.log(`   ✅ Updated ${result.companionName}: ${result.filename}`);
        } catch (error) {
          console.error(`   ❌ Failed to update ${result.companionName}:`, error.message);
        }
      } else {
        console.log(`   ❌ Failed ${result.companionName}: ${result.error}`);
      }
    }

    console.log(`\n💾 Updated ${updatedCount} companion records in database`);

    // Show final status
    const [totalCount] = await pool.execute('SELECT COUNT(*) as total FROM companions');
    const [withImagesCount] = await pool.execute(`
      SELECT COUNT(*) as with_images 
      FROM companions 
      WHERE profile_image_url IS NOT NULL 
        AND profile_image_url != '' 
        AND profile_image_url != 'null'
    `);

    console.log('\n📊 Final Status:');
    console.log(`   Total companions: ${totalCount[0].total}`);
    console.log(`   With profile pictures: ${withImagesCount[0].with_images}`);
    console.log(`   Completion rate: ${((withImagesCount[0].with_images / totalCount[0].total) * 100).toFixed(1)}%`);

    if (stats.successful === companions.length) {
      console.log('\n🎉 All remaining companions now have profile pictures!');
    } else {
      console.log('\n⚠️  Some companions still need images. Check billing limits.');
    }

  } catch (error) {
    console.error('❌ Error generating remaining images:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateRemainingImages()
    .then(() => {
      console.log('\n✨ Remaining image generation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to generate remaining images:', error);
      process.exit(1);
    });
}

module.exports = { generateRemainingImages };
