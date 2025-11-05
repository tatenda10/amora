const pool = require('../db/connection');
const ImageGenerationService = require('../services/imageGenerationService');
const AgeDistributionUpdater = require('./update-companion-ages');

/**
 * Complete Companion Profile Generation Pipeline
 * 1. Update ages with realistic distribution
 * 2. Generate AI profile pictures
 * 3. Update database with new images
 */

class CompanionProfileGenerator {
  constructor() {
    this.imageService = new ImageGenerationService();
    this.ageUpdater = new AgeDistributionUpdater();
  }

  /**
   * Run the complete profile generation pipeline
   */
  async generateAllProfiles(options = {}) {
    const {
      updateAges = true,
      generateImages = true,
      batchSize = 5,
      delayMs = 3000,
      dryRun = false
    } = options;

    try {
      console.log('🚀 Starting Companion Profile Generation Pipeline\n');
      console.log('=' .repeat(60));

      // Step 1: Update ages if requested
      if (updateAges) {
        console.log('\n📊 STEP 1: Updating Companion Ages');
        console.log('-'.repeat(40));
        
        if (dryRun) {
          console.log('🔍 DRY RUN: Would update ages');
          await this.ageUpdater.showCurrentDistribution();
        } else {
          await this.ageUpdater.updateAllCompanionAges();
        }
      }

      // Step 2: Generate profile pictures if requested
      if (generateImages) {
        console.log('\n🎨 STEP 2: Generating Profile Pictures');
        console.log('-'.repeat(40));

        if (dryRun) {
          console.log('🔍 DRY RUN: Would generate images');
          const companions = await this.getCompanionsWithoutImages();
          console.log(`Would generate ${companions.length} profile pictures`);
        } else {
          await this.generateAllProfilePictures(batchSize, delayMs);
        }
      }

      console.log('\n✨ Profile generation pipeline completed!');
      console.log('=' .repeat(60));

    } catch (error) {
      console.error('❌ Error in profile generation pipeline:', error);
      throw error;
    }
  }

  /**
   * Generate profile pictures for all companions
   */
  async generateAllProfilePictures(batchSize = 5, delayMs = 3000) {
    try {
      // Get companions without profile pictures
      const companions = await this.getCompanionsWithoutImages();
      
      if (companions.length === 0) {
        console.log('✅ All companions already have profile pictures!');
        return;
      }

      console.log(`🎯 Found ${companions.length} companions without profile pictures`);
      console.log(`📦 Processing in batches of ${batchSize} with ${delayMs}ms delay\n`);

      // Process in batches to respect API limits
      const batches = this.chunkArray(companions, batchSize);
      let totalResults = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n🔄 Processing Batch ${i + 1}/${batches.length} (${batch.length} companions)`);
        console.log('-'.repeat(30));

        const batchResults = await this.imageService.generateBatchProfilePictures(batch, delayMs);
        totalResults = totalResults.concat(batchResults);

        // Update database with successful generations
        await this.updateCompanionImages(batchResults);

        // Show batch statistics
        const batchStats = this.imageService.getGenerationStats(batchResults);
        console.log(`\n📊 Batch ${i + 1} Results: ${batchStats.successful}/${batchStats.total} successful (${batchStats.successRate})`);

        // Add extra delay between batches
        if (i < batches.length - 1) {
          console.log(`⏳ Waiting ${delayMs * 2}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, delayMs * 2));
        }
      }

      // Show final statistics
      const finalStats = this.imageService.getGenerationStats(totalResults);
      console.log('\n🎉 Final Results:');
      console.log(`   Total processed: ${finalStats.total}`);
      console.log(`   Successful: ${finalStats.successful}`);
      console.log(`   Failed: ${finalStats.failed}`);
      console.log(`   Success rate: ${finalStats.successRate}`);

      // Show failed companions
      const failed = totalResults.filter(r => !r.success);
      if (failed.length > 0) {
        console.log('\n❌ Failed to generate images for:');
        failed.forEach(f => {
          console.log(`   - ${f.companionName} (ID: ${f.companionId}): ${f.error}`);
        });
      }

    } catch (error) {
      console.error('❌ Error generating profile pictures:', error);
      throw error;
    }
  }

  /**
   * Get companions without profile pictures
   */
  async getCompanionsWithoutImages() {
    const [companions] = await pool.execute(`
      SELECT 
        id, name, age, gender, country, ethnicity, personality
      FROM companions 
      WHERE profile_image_url IS NULL 
         OR profile_image_url = '' 
         OR profile_image_url = 'null'
      ORDER BY id
    `);
    return companions;
  }

  /**
   * Update companion database records with new images
   */
  async updateCompanionImages(results) {
    console.log('\n💾 Updating database with new images...');
    
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
      }
    }
    
    console.log(`\n📊 Updated ${updatedCount} companion records in database`);
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Show current profile status
   */
  async showProfileStatus() {
    try {
      const [totalCount] = await pool.execute('SELECT COUNT(*) as total FROM companions');
      const [withImagesCount] = await pool.execute(`
        SELECT COUNT(*) as with_images 
        FROM companions 
        WHERE profile_image_url IS NOT NULL 
          AND profile_image_url != '' 
          AND profile_image_url != 'null'
      `);
      const [withoutImagesCount] = await pool.execute(`
        SELECT COUNT(*) as without_images 
        FROM companions 
        WHERE profile_image_url IS NULL 
          OR profile_image_url = '' 
          OR profile_image_url = 'null'
      `);

      console.log('📊 Current Profile Status:');
      console.log(`   Total companions: ${totalCount[0].total}`);
      console.log(`   With profile pictures: ${withImagesCount[0].with_images}`);
      console.log(`   Without profile pictures: ${withoutImagesCount[0].without_images}`);
      console.log(`   Completion rate: ${((withImagesCount[0].with_images / totalCount[0].total) * 100).toFixed(1)}%`);

    } catch (error) {
      console.error('❌ Error showing profile status:', error);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const generator = new CompanionProfileGenerator();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    updateAges: !args.includes('--no-ages'),
    generateImages: !args.includes('--no-images'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 5,
    delayMs: parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 3000,
    dryRun: args.includes('--dry-run')
  };

  console.log('🎯 Companion Profile Generator');
  console.log('Options:', options);
  console.log();

  generator.showProfileStatus()
    .then(() => {
      return generator.generateAllProfiles(options);
    })
    .then(() => {
      console.log('\n🎉 All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Profile generation failed:', error);
      process.exit(1);
    });
}

module.exports = CompanionProfileGenerator;
