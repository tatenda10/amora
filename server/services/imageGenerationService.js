const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * AI Image Generation Service for Companion Profile Pictures
 * Uses OpenAI DALL-E 3 to generate realistic profile pictures
 */

class ImageGenerationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.uploadsDir = path.join(__dirname, '../uploads/companions');
    this.ensureUploadsDir();
  }

  /**
   * Ensure uploads directory exists
   */
  async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  /**
   * Generate age-appropriate profile picture for companion
   */
  async generateProfilePicture(companion) {
    try {
      console.log(`🎨 Generating profile picture for ${companion.name}...`);
      
      // Create detailed prompt based on companion attributes
      const prompt = this.createImagePrompt(companion);
      
      // Generate image using DALL-E 3
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      const imageUrl = response.data[0].url;
      console.log(`✅ Generated image for ${companion.name}: ${imageUrl}`);

      // Download and save the image
      const filename = await this.downloadAndSaveImage(imageUrl, companion);
      
      return {
        success: true,
        filename: filename,
        url: `/uploads/companions/${filename}`,
        originalUrl: imageUrl
      };

    } catch (error) {
      console.error(`❌ Error generating image for ${companion.name}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create detailed image generation prompt
   */
  createImagePrompt(companion) {
    const { name, age, gender, country, ethnicity, personality } = companion;
    
    // Age-appropriate styling
    const ageGroup = this.getAgeGroup(age);
    const ageStyle = this.getAgeStyle(ageGroup);
    
    // Country-specific styling hints
    const countryStyle = this.getCountryStyle(country);
    
    // Personality-based expression
    const personalityExpression = this.getPersonalityExpression(personality);
    
    const prompt = `Professional headshot portrait of a ${age}-year-old ${gender} from ${country}, ${ethnicity} ethnicity. 
    
    ${ageStyle}
    ${countryStyle}
    ${personalityExpression}
    
    High-quality, natural lighting, soft background, friendly and approachable expression. 
    Clean, modern style suitable for a dating app profile. 
    No text, logos, or watermarks. 
    Photorealistic, professional quality.`;

    return prompt;
  }

  /**
   * Get age group for styling
   */
  getAgeGroup(age) {
    if (age >= 18 && age <= 25) return 'young-adult';
    if (age >= 26 && age <= 35) return 'adult';
    if (age >= 36 && age <= 45) return 'mature-adult';
    if (age >= 46 && age <= 55) return 'middle-aged';
    return 'senior';
  }

  /**
   * Get age-appropriate styling
   */
  getAgeStyle(ageGroup) {
    const styles = {
      'young-adult': 'Modern, trendy clothing, youthful appearance, contemporary hairstyle.',
      'adult': 'Professional yet casual attire, confident posture, well-groomed appearance.',
      'mature-adult': 'Sophisticated clothing, experienced look, refined style.',
      'middle-aged': 'Elegant, mature appearance, distinguished features, classic style.',
      'senior': 'Distinguished, wise appearance, elegant and refined, silver or gray hair.'
    };
    return styles[ageGroup] || styles['adult'];
  }

  /**
   * Get country-specific styling hints
   */
  getCountryStyle(country) {
    const countryStyles = {
      'United States': 'American style, diverse background, confident expression.',
      'United Kingdom': 'British style, sophisticated appearance, refined features.',
      'Germany': 'European style, clean-cut appearance, professional look.',
      'Mexico': 'Latin American features, warm expression, vibrant personality.',
      'Australia': 'Relaxed, friendly Australian style, outdoor lifestyle appearance.',
      'Japan': 'Japanese features, elegant and refined appearance, modern style.',
      'Canada': 'North American style, friendly and approachable, diverse background.',
      'France': 'French elegance, sophisticated style, refined features.',
      'Italy': 'Italian style, expressive features, warm Mediterranean appearance.',
      'Spain': 'Spanish features, passionate expression, Mediterranean style.'
    };
    return countryStyles[country] || 'International style, diverse background.';
  }

  /**
   * Get personality-based expression
   */
  getPersonalityExpression(personality) {
    const expressions = {
      'Adventurous': 'Confident, energetic expression, adventurous spirit visible.',
      'Romantic': 'Warm, loving expression, gentle smile, romantic aura.',
      'Intellectual': 'Thoughtful expression, intelligent eyes, contemplative look.',
      'Funny': 'Playful expression, mischievous smile, humorous twinkle in eyes.',
      'Caring': 'Kind, compassionate expression, nurturing smile, gentle eyes.',
      'Ambitious': 'Determined expression, confident posture, goal-oriented look.',
      'Creative': 'Artistic expression, creative spark in eyes, imaginative look.',
      'Athletic': 'Fit, healthy appearance, active lifestyle visible, energetic.',
      'Mysterious': 'Intriguing expression, captivating eyes, enigmatic smile.',
      'Loyal': 'Trustworthy expression, reliable look, steadfast appearance.'
    };
    return expressions[personality] || 'Friendly, approachable expression, warm smile.';
  }

  /**
   * Download image from URL and save to local storage
   */
  async downloadAndSaveImage(imageUrl, companion) {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const filename = `${timestamp}-${companion.id}-${companion.name.toLowerCase().replace(/\s+/g, '-')}.webp`;
      const filepath = path.join(this.uploadsDir, filename);

      const protocol = imageUrl.startsWith('https:') ? https : http;
      
      const request = protocol.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const fileStream = require('fs').createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`💾 Saved image: ${filename}`);
          resolve(filename);
        });

        fileStream.on('error', (error) => {
          require('fs').unlink(filepath, () => {}); // Delete partial file
          reject(error);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  /**
   * Generate multiple profile pictures in batch
   */
  async generateBatchProfilePictures(companions, delayMs = 2000) {
    const results = [];
    
    for (let i = 0; i < companions.length; i++) {
      const companion = companions[i];
      
      try {
        console.log(`\n🔄 Processing ${i + 1}/${companions.length}: ${companion.name}`);
        
        const result = await this.generateProfilePicture(companion);
        results.push({
          companionId: companion.id,
          companionName: companion.name,
          ...result
        });

        // Add delay to respect API rate limits
        if (i < companions.length - 1) {
          console.log(`⏳ Waiting ${delayMs}ms before next generation...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

      } catch (error) {
        console.error(`❌ Failed to generate image for ${companion.name}:`, error);
        results.push({
          companionId: companion.id,
          companionName: companion.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get generation statistics
   */
  getGenerationStats(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      total: results.length,
      successful,
      failed,
      successRate: ((successful / results.length) * 100).toFixed(1) + '%'
    };
  }
}

module.exports = ImageGenerationService;
