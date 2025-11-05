const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Process Kaggle Human Conversation Training Data
 * Download and extract conversation patterns
 */

async function downloadAndProcessKaggleDataset() {
  try {
    console.log('📥 Downloading Kaggle dataset: projjal1/human-conversation-training-data');
    
    // Check if kagglehub is available
    try {
      execSync('python -c "import kagglehub"', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ kagglehub not found. Please install it first:');
      console.log('   pip install kagglehub');
      return null;
    }
    
    // Run Python script to download dataset
    const pythonScript = `
import kagglehub
import os
import json
import sys

try:
    print("📥 Downloading Kaggle dataset...")
    path = kagglehub.dataset_download("projjal1/human-conversation-training-data")
    print(f"✅ Dataset downloaded to: {path}")
    
    # List files
    if os.path.exists(path):
        files = os.listdir(path)
        print(f"📁 Files: {files}")
        
        # Find JSON files
        json_files = [f for f in files if f.endswith('.json')]
        if json_files:
            print(f"📄 JSON files: {json_files}")
            
            # Process first JSON file
            json_path = os.path.join(path, json_files[0])
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"📊 Sample data from {json_files[0]}:")
            if isinstance(data, list) and len(data) > 0:
                print(f"   - Items: {len(data)}")
                print(f"   - Keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'Not dict'}")
            elif isinstance(data, dict):
                print(f"   - Keys: {list(data.keys())}")
    
    print(f"DATASET_PATH:{path}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
`;
    
    // Execute Python script
    const result = execSync(`python -c "${pythonScript}"`, { encoding: 'utf8' });
    console.log(result);
    
    // Extract dataset path
    const pathMatch = result.match(/DATASET_PATH:(.+)/);
    if (pathMatch) {
      const datasetPath = pathMatch[1].trim();
      console.log(`📁 Dataset path: ${datasetPath}`);
      
      // Process the dataset
      return await processKaggleDataset(datasetPath);
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Error downloading Kaggle dataset:', error);
    return null;
  }
}

async function processKaggleDataset(datasetPath) {
  try {
    console.log('🔄 Processing Kaggle dataset...');
    
    if (!fs.existsSync(datasetPath)) {
      throw new Error('Dataset path not found');
    }
    
    const files = fs.readdirSync(datasetPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`📄 Found ${jsonFiles.length} JSON files: ${jsonFiles.join(', ')}`);
    
    const allConversations = [];
    
    // Process each JSON file
    for (const jsonFile of jsonFiles) {
      const filePath = path.join(datasetPath, jsonFile);
      console.log(`📖 Processing ${jsonFile}...`);
      
      try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        
        // Convert to our conversation format
        const conversations = convertToConversationFormat(data, jsonFile);
        allConversations.push(...conversations);
        
        console.log(`✅ Processed ${conversations.length} conversations from ${jsonFile}`);
        
      } catch (error) {
        console.log(`❌ Error processing ${jsonFile}:`, error.message);
      }
    }
    
    // Save processed conversations
    const outputPath = path.join(__dirname, '../datasets/kaggle_conversations_processed.json');
    fs.writeFileSync(outputPath, JSON.stringify(allConversations, null, 2));
    
    console.log(`✅ Total processed conversations: ${allConversations.length}`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    return allConversations;
    
  } catch (error) {
    console.error('❌ Error processing Kaggle dataset:', error);
    throw error;
  }
}

function convertToConversationFormat(data, filename) {
  const conversations = [];
  
  try {
    if (Array.isArray(data)) {
      // Handle array of conversations
      data.forEach((item, index) => {
        if (item && typeof item === 'object') {
          const conv = extractConversation(item, filename, index);
          if (conv) conversations.push(conv);
        }
      });
    } else if (typeof data === 'object') {
      // Handle object with conversation data
      Object.keys(data).forEach(key => {
        const item = data[key];
        if (item && typeof item === 'object') {
          const conv = extractConversation(item, filename, key);
          if (conv) conversations.push(conv);
        }
      });
    }
  } catch (error) {
    console.log(`❌ Error converting ${filename}:`, error.message);
  }
  
  return conversations;
}

function extractConversation(item, filename, index) {
  try {
    // Common conversation formats
    let userMessage = null;
    let aiResponse = null;
    let context = 'general';
    let emotion = 'neutral';
    
    // Try different field names
    const userFields = ['user_message', 'user', 'input', 'question', 'prompt', 'message'];
    const aiFields = ['ai_response', 'assistant', 'output', 'answer', 'response', 'reply'];
    
    // Find user message
    for (const field of userFields) {
      if (item[field] && typeof item[field] === 'string') {
        userMessage = item[field];
        break;
      }
    }
    
    // Find AI response
    for (const field of aiFields) {
      if (item[field] && typeof item[field] === 'string') {
        aiResponse = item[field];
        break;
      }
    }
    
    // Extract context and emotion if available
    if (item.context) context = item.context;
    if (item.emotion) emotion = item.emotion;
    if (item.category) context = item.category;
    if (item.sentiment) emotion = item.sentiment;
    
    // Create conversation if we have both messages
    if (userMessage && aiResponse && 
        userMessage.length > 3 && aiResponse.length > 3) {
      
      return {
        user_message: userMessage.trim(),
        ai_response: aiResponse.trim(),
        context: context,
        emotion: emotion,
        style: "kaggle_human",
        source: `kaggle_${filename}`,
        original_index: index
      };
    }
    
    return null;
    
  } catch (error) {
    console.log(`❌ Error extracting conversation from ${filename}[${index}]:`, error.message);
    return null;
  }
}

// Run if called directly
if (require.main === module) {
  downloadAndProcessKaggleDataset()
    .then((conversations) => {
      if (conversations) {
        console.log(`\n🎉 Kaggle dataset processing complete! Processed ${conversations.length} conversations.`);
      } else {
        console.log('\n❌ Kaggle dataset processing failed.');
      }
    })
    .catch(error => {
      console.error('💥 Failed to process Kaggle dataset:', error);
      process.exit(1);
    });
}

module.exports = { downloadAndProcessKaggleDataset, processKaggleDataset };
