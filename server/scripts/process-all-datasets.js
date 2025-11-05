const { processMetaDataset } = require('./process-meta-dataset');
const { downloadAndProcessKaggleDataset } = require('./process-kaggle-dataset');
const fs = require('fs');
const path = require('path');

/**
 * Master script to process all available datasets
 * Meta Casual Conversations v2 + Kaggle Human Conversation Training Data
 */

async function processAllDatasets() {
  console.log('🚀 Starting processing of all conversation datasets...\n');
  
  const results = {
    meta: { success: false, conversations: 0, error: null },
    kaggle: { success: false, conversations: 0, error: null }
  };
  
  // Process Meta Casual Conversations v2
  try {
    console.log('📥 [1/2] Processing Meta Casual Conversations v2...');
    const metaConversations = await processMetaDataset();
    results.meta.success = true;
    results.meta.conversations = metaConversations.length;
    console.log('✅ Meta dataset processed successfully!\n');
  } catch (error) {
    console.log('❌ Meta dataset processing failed:', error.message);
    results.meta.error = error.message;
  }
  
  // Process Kaggle Human Conversation Training Data
  try {
    console.log('📥 [2/2] Processing Kaggle Human Conversation Training Data...');
    const kaggleConversations = await downloadAndProcessKaggleDataset();
    if (kaggleConversations) {
      results.kaggle.success = true;
      results.kaggle.conversations = kaggleConversations.length;
      console.log('✅ Kaggle dataset processed successfully!\n');
    } else {
      console.log('❌ Kaggle dataset processing failed\n');
    }
  } catch (error) {
    console.log('❌ Kaggle dataset processing failed:', error.message);
    results.kaggle.error = error.message;
  }
  
  // Summary
  console.log('📊 Processing Summary:');
  console.log(`✅ Meta Casual Conversations: ${results.meta.success ? 'Success' : 'Failed'} (${results.meta.conversations} conversations)`);
  console.log(`✅ Kaggle Human Conversations: ${results.kaggle.success ? 'Success' : 'Failed'} (${results.kaggle.conversations} conversations)`);
  
  if (results.meta.error) {
    console.log(`❌ Meta Error: ${results.meta.error}`);
  }
  if (results.kaggle.error) {
    console.log(`❌ Kaggle Error: ${results.kaggle.error}`);
  }
  
  // List all processed datasets
  const datasetsDir = path.join(__dirname, '../datasets');
  const files = fs.readdirSync(datasetsDir).filter(f => f.endsWith('_processed.json'));
  
  console.log('\n📁 Processed datasets:');
  files.forEach(file => {
    const filePath = path.join(datasetsDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   - ${file} (${sizeKB} KB)`);
  });
  
  const totalConversations = results.meta.conversations + results.kaggle.conversations;
  const successCount = (results.meta.success ? 1 : 0) + (results.kaggle.success ? 1 : 0);
  
  console.log(`\n🎉 Successfully processed ${successCount}/2 datasets!`);
  console.log(`📊 Total conversations: ${totalConversations}`);
  
  if (totalConversations > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Integrate processed datasets into LangChain system');
    console.log('2. Update conversation patterns in LangGraph agent');
    console.log('3. Test improved conversation quality');
    console.log('4. Fine-tune responses based on dataset patterns');
  }
  
  return results;
}

// Run if called directly
if (require.main === module) {
  processAllDatasets()
    .then((results) => {
      console.log('\n✨ All dataset processing completed!');
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { processAllDatasets };
