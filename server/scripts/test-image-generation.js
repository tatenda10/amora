const pool = require('../db/connection');
const ImageGenerationService = require('../services/imageGenerationService');

/**
 * Test image generation with a small batch of companions
 */

async function testImageGeneration() {
  try {
    console.log('🧪 Testing Image Generation with Small Batch\n');

    const imageService = new ImageGenerationService();

    // Get first 3 companions without images for testing
    const [companions] = await pool.execute(`
      SELECT 
        id, name, age, gender, country, ethnicity, personality
      FROM companions 
      WHERE profile_image_url IS NULL 
         OR profile_image_url = '' 
         OR profile_image_url = 'null'
      ORDER BY id
      LIMIT 3
    `);

    if (companions.length === 0) {
      console.log('✅ All companions already have profile pictures!');
      return;
    }

    console.log(`🎯 Testing with ${companions.length} companions:`);
    companions.forEach(c => {
      console.log(`   - ${c.name} (${c.age} years, ${c.gender}, ${c.country})`);
    });
    console.log();

    // Test image generation
    const results = await imageService.generateBatchProfilePictures(companions, 2000);

    // Show results
    console.log('\n📊 Test Results:');
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

    if (stats.successful > 0) {
      console.log('\n🎉 Test successful! Ready to generate images for all companions.');
    } else {
      console.log('\n⚠️  Test failed. Check API key and configuration.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  testImageGeneration()
    .then(() => {
      console.log('\n✨ Test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testImageGeneration };
