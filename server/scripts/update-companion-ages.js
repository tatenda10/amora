const pool = require('../db/connection');

/**
 * Update companion ages to have more realistic distribution across age groups
 */

class AgeDistributionUpdater {
  constructor() {
    // Realistic age distribution for dating app
    this.ageGroups = {
      'young-adult': { min: 18, max: 25, weight: 0.25 }, // 25% - Young adults
      'adult': { min: 26, max: 35, weight: 0.40 },       // 40% - Main demographic
      'mature-adult': { min: 36, max: 45, weight: 0.20 }, // 20% - Mature adults
      'middle-aged': { min: 46, max: 55, weight: 0.10 },  // 10% - Middle-aged
      'senior': { min: 56, max: 65, weight: 0.05 }        // 5% - Senior
    };
  }

  /**
   * Get random age from age group
   */
  getRandomAgeFromGroup(ageGroup) {
    const { min, max } = this.ageGroups[ageGroup];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Select age group based on weight
   */
  selectAgeGroup() {
    const random = Math.random();
    let cumulative = 0;

    for (const [group, config] of Object.entries(this.ageGroups)) {
      cumulative += config.weight;
      if (random <= cumulative) {
        return group;
      }
    }

    return 'adult'; // fallback
  }

  /**
   * Generate realistic age for companion
   */
  generateRealisticAge() {
    const ageGroup = this.selectAgeGroup();
    return this.getRandomAgeFromGroup(ageGroup);
  }

  /**
   * Update all companion ages
   */
  async updateAllCompanionAges() {
    try {
      console.log('🔄 Updating companion ages with realistic distribution...\n');

      // Get all companions
      const [companions] = await pool.execute(`
        SELECT id, name, age, gender, country 
        FROM companions 
        ORDER BY id
      `);

      console.log(`📊 Found ${companions.length} companions to update\n`);

      const ageDistribution = {};
      const updates = [];

      // Generate new ages and prepare updates
      for (const companion of companions) {
        const newAge = this.generateRealisticAge();
        const ageGroup = this.getAgeGroup(newAge);
        
        // Track distribution
        ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
        
        updates.push({
          id: companion.id,
          name: companion.name,
          oldAge: companion.age,
          newAge: newAge,
          ageGroup: ageGroup
        });
      }

      // Show planned distribution
      console.log('📈 Planned Age Distribution:');
      for (const [group, count] of Object.entries(ageDistribution)) {
        const percentage = ((count / companions.length) * 100).toFixed(1);
        console.log(`   ${group}: ${count} companions (${percentage}%)`);
      }
      console.log();

      // Update database
      console.log('💾 Updating database...');
      let updatedCount = 0;

      for (const update of updates) {
        try {
          await pool.execute(
            'UPDATE companions SET age = ? WHERE id = ?',
            [update.newAge, update.id]
          );
          updatedCount++;
          
          console.log(`   ✅ ${update.name}: ${update.oldAge} → ${update.newAge} (${update.ageGroup})`);
        } catch (error) {
          console.error(`   ❌ Failed to update ${update.name}:`, error.message);
        }
      }

      console.log(`\n✨ Successfully updated ${updatedCount}/${companions.length} companions`);

      // Show final distribution
      const [finalCompanions] = await pool.execute(`
        SELECT age FROM companions ORDER BY age
      `);

      const finalDistribution = {};
      finalCompanions.forEach(companion => {
        const ageGroup = this.getAgeGroup(companion.age);
        finalDistribution[ageGroup] = (finalDistribution[ageGroup] || 0) + 1;
      });

      console.log('\n📊 Final Age Distribution:');
      for (const [group, count] of Object.entries(finalDistribution)) {
        const percentage = ((count / companions.length) * 100).toFixed(1);
        console.log(`   ${group}: ${count} companions (${percentage}%)`);
      }

      // Show age range
      const ages = finalCompanions.map(c => c.age);
      const minAge = Math.min(...ages);
      const maxAge = Math.max(...ages);
      console.log(`\n📏 Age Range: ${minAge} - ${maxAge} years`);

    } catch (error) {
      console.error('❌ Error updating companion ages:', error);
      throw error;
    }
  }

  /**
   * Get age group for a given age
   */
  getAgeGroup(age) {
    if (age >= 18 && age <= 25) return 'young-adult';
    if (age >= 26 && age <= 35) return 'adult';
    if (age >= 36 && age <= 45) return 'mature-adult';
    if (age >= 46 && age <= 55) return 'middle-aged';
    if (age >= 56 && age <= 65) return 'senior';
    return 'adult';
  }

  /**
   * Show current age distribution
   */
  async showCurrentDistribution() {
    try {
      const [companions] = await pool.execute(`
        SELECT age FROM companions ORDER BY age
      `);

      const distribution = {};
      companions.forEach(companion => {
        const ageGroup = this.getAgeGroup(companion.age);
        distribution[ageGroup] = (distribution[ageGroup] || 0) + 1;
      });

      console.log('📊 Current Age Distribution:');
      for (const [group, count] of Object.entries(distribution)) {
        const percentage = ((count / companions.length) * 100).toFixed(1);
        console.log(`   ${group}: ${count} companions (${percentage}%)`);
      }

      const ages = companions.map(c => c.age);
      const minAge = Math.min(...ages);
      const maxAge = Math.max(...ages);
      console.log(`\n📏 Current Age Range: ${minAge} - ${maxAge} years`);

    } catch (error) {
      console.error('❌ Error showing current distribution:', error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const updater = new AgeDistributionUpdater();
  
  updater.showCurrentDistribution()
    .then(() => {
      console.log('\n' + '='.repeat(50) + '\n');
      return updater.updateAllCompanionAges();
    })
    .then(() => {
      console.log('\n✨ Age update completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to update companion ages:', error);
      process.exit(1);
    });
}

module.exports = AgeDistributionUpdater;
