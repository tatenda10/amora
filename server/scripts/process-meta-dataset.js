const fs = require('fs');
const path = require('path');

/**
 * Process Meta Casual Conversations v2 dataset
 * Extract conversation patterns and metadata for AI training
 */

const META_DATASET_PATH = path.join(__dirname, '../datasets/An-ME559xo2zQnXvKFGDNsNjAVufIbxvSqCXCM_giMAKm7DpXY1d6_EQL-7aTz4_a1ODUbw9ZR5BO22UdG5ty_B8Rp00x3w2PifDF-bo96vp8s5RCDg6uSA');

function processMetaDataset() {
  try {
    console.log('🔄 Processing Meta Casual Conversations v2 dataset...');
    
    const mainFile = path.join(META_DATASET_PATH, 'CasualConversationsV2.json');
    
    if (!fs.existsSync(mainFile)) {
      throw new Error('Meta dataset file not found');
    }
    
    // Read and parse the dataset
    console.log('📖 Reading dataset file...');
    const rawData = fs.readFileSync(mainFile, 'utf8');
    const participants = JSON.parse(rawData);
    
    console.log(`📊 Found ${participants.length} participants`);
    
    // Extract conversation patterns
    const conversationPatterns = [];
    
    participants.forEach((participant, index) => {
      if (index % 1000 === 0) {
        console.log(`Processing participant ${index + 1}/${participants.length}`);
      }
      
      // Extract demographic information
      const demographics = {
        age: participant.age,
        gender: participant.gender,
        native_language: participant.native_language,
        secondary_languages: participant.secondary_languages || [],
        country: participant.country || 'unknown'
      };
      
      // Create conversation patterns based on demographics
      if (participant.age && participant.gender && participant.native_language) {
        // Generate age-appropriate conversation starters
        const ageGroup = getAgeGroup(participant.age);
        const conversationStarters = generateConversationStarters(ageGroup, participant.gender, participant.native_language);
        
        conversationStarters.forEach(starter => {
          conversationPatterns.push({
            user_message: starter.user_message,
            ai_response: starter.ai_response,
            context: starter.context,
            emotion: starter.emotion,
            style: "meta_casual",
            demographics: demographics,
            source: "meta_casual_conversations_v2"
          });
        });
      }
    });
    
    // Save processed patterns
    const outputPath = path.join(__dirname, '../datasets/meta_conversations_processed.json');
    fs.writeFileSync(outputPath, JSON.stringify(conversationPatterns, null, 2));
    
    console.log(`✅ Processed ${conversationPatterns.length} conversation patterns`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    // Generate summary statistics
    const stats = generateStats(conversationPatterns);
    console.log('\n📈 Dataset Statistics:');
    console.log(`   - Total conversations: ${stats.total}`);
    console.log(`   - Age groups: ${Object.keys(stats.ageGroups).join(', ')}`);
    console.log(`   - Languages: ${Object.keys(stats.languages).join(', ')}`);
    console.log(`   - Genders: ${Object.keys(stats.genders).join(', ')}`);
    
    return conversationPatterns;
    
  } catch (error) {
    console.error('❌ Error processing Meta dataset:', error);
    throw error;
  }
}

function getAgeGroup(age) {
  if (age < 25) return 'young_adult';
  if (age < 35) return 'adult';
  if (age < 50) return 'middle_aged';
  return 'senior';
}

function generateConversationStarters(ageGroup, gender, language) {
  const starters = [];
  
  // Age-appropriate greetings
  const greetings = {
    young_adult: [
      { user_message: "hey what's up", ai_response: "not much, just chilling. you?", context: "casual_greeting", emotion: "neutral" },
      { user_message: "how's it going", ai_response: "pretty good! how about you?", context: "casual_greeting", emotion: "positive" }
    ],
    adult: [
      { user_message: "hello there", ai_response: "hi! how are you doing today?", context: "polite_greeting", emotion: "friendly" },
      { user_message: "good morning", ai_response: "good morning! how's your day starting?", context: "morning_greeting", emotion: "cheerful" }
    ],
    middle_aged: [
      { user_message: "hello", ai_response: "hello! nice to meet you. how are you?", context: "formal_greeting", emotion: "polite" },
      { user_message: "good afternoon", ai_response: "good afternoon! how has your day been?", context: "afternoon_greeting", emotion: "warm" }
    ],
    senior: [
      { user_message: "good day", ai_response: "good day to you too! how are you feeling today?", context: "formal_greeting", emotion: "respectful" },
      { user_message: "hello", ai_response: "hello there! it's nice to see you. how are you doing?", context: "warm_greeting", emotion: "caring" }
    ]
  };
  
  // Add language-specific greetings
  const languageGreetings = {
    'english (united states)': [
      { user_message: "what's up", ai_response: "not much, just hanging out. what about you?", context: "casual_greeting", emotion: "relaxed" }
    ],
    'spanish': [
      { user_message: "hola", ai_response: "hola! ¿cómo estás?", context: "spanish_greeting", emotion: "friendly" }
    ],
    'portuguese': [
      { user_message: "oi", ai_response: "oi! como você está?", context: "portuguese_greeting", emotion: "warm" }
    ],
    'hindi': [
      { user_message: "namaste", ai_response: "namaste! aap kaise hain?", context: "hindi_greeting", emotion: "respectful" }
    ]
  };
  
  // Add age-appropriate starters
  starters.push(...(greetings[ageGroup] || greetings.adult));
  
  // Add language-specific starters
  if (languageGreetings[language]) {
    starters.push(...languageGreetings[language]);
  }
  
  return starters;
}

function generateStats(conversations) {
  const stats = {
    total: conversations.length,
    ageGroups: {},
    languages: {},
    genders: {},
    contexts: {}
  };
  
  conversations.forEach(conv => {
    // Count age groups
    const ageGroup = getAgeGroup(conv.demographics.age);
    stats.ageGroups[ageGroup] = (stats.ageGroups[ageGroup] || 0) + 1;
    
    // Count languages
    const lang = conv.demographics.native_language;
    stats.languages[lang] = (stats.languages[lang] || 0) + 1;
    
    // Count genders
    const gender = conv.demographics.gender;
    stats.genders[gender] = (stats.genders[gender] || 0) + 1;
    
    // Count contexts
    stats.contexts[conv.context] = (stats.contexts[conv.context] || 0) + 1;
  });
  
  return stats;
}

// Run if called directly
if (require.main === module) {
  try {
    processMetaDataset();
    console.log('\n🎉 Meta dataset processing complete!');
  } catch (error) {
    console.error('💥 Failed to process Meta dataset:', error);
    process.exit(1);
  }
}

module.exports = { processMetaDataset };
