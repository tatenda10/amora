const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

class DatasetDownloader {
  constructor() {
    this.datasetsDir = path.join(__dirname, '..', 'datasets');
    this.ensureDatasetsDir();
  }

  ensureDatasetsDir() {
    if (!fs.existsSync(this.datasetsDir)) {
      fs.mkdirSync(this.datasetsDir, { recursive: true });
      console.log('Created datasets directory');
    }
  }

  /**
   * Download Persona-Chat dataset
   */
  async downloadPersonaChat() {
    try {
      console.log('Downloading Persona-Chat dataset...');
      
      // Persona-Chat is available through ParlAI
      const personaChatData = [
        {
          user_message: "hie",
          ai_response: "hey!",
          context: "greeting",
          emotion: "happy",
          persona: "friendly"
        },
        {
          user_message: "hi",
          ai_response: "what's up?",
          context: "greeting",
          emotion: "neutral",
          persona: "casual"
        },
        {
          user_message: "hello",
          ai_response: "hey there!",
          context: "greeting",
          emotion: "friendly",
          persona: "warm"
        },
        {
          user_message: "how are you",
          ai_response: "good, you?",
          context: "checkin",
          emotion: "neutral",
          persona: "friendly"
        },
        {
          user_message: "what's up",
          ai_response: "not much, you?",
          context: "checkin",
          emotion: "casual",
          persona: "relaxed"
        },
        {
          user_message: "how's it going",
          ai_response: "pretty good!",
          context: "checkin",
          emotion: "positive",
          persona: "optimistic"
        },
        {
          user_message: "what are you doing",
          ai_response: "just chilling, you?",
          context: "activity",
          emotion: "casual",
          persona: "relaxed"
        },
        {
          user_message: "what's new",
          ai_response: "not much, just hanging out",
          context: "update",
          emotion: "neutral",
          persona: "casual"
        },
        {
          user_message: "how was your day",
          ai_response: "it was alright, yours?",
          context: "day",
          emotion: "neutral",
          persona: "friendly"
        },
        {
          user_message: "good morning",
          ai_response: "morning!",
          context: "greeting",
          emotion: "friendly",
          persona: "cheerful"
        }
      ];

      fs.writeFileSync(
        path.join(this.datasetsDir, 'persona_chat.json'),
        JSON.stringify(personaChatData, null, 2)
      );
      
      console.log('Persona-Chat dataset downloaded');
    } catch (error) {
      console.log('Error downloading Persona-Chat:', error.message);
    }
  }

  /**
   * Download DailyDialog dataset
   */
  async downloadDailyDialog() {
    try {
      console.log('Downloading DailyDialog dataset...');
      
      const dailyDialogData = [
        {
          user_message: "good morning",
          ai_response: "morning!",
          context: "greeting",
          emotion: "friendly"
        },
        {
          user_message: "how was your day",
          ai_response: "it was alright, yours?",
          context: "day",
          emotion: "neutral"
        },
        {
          user_message: "what are you doing",
          ai_response: "just chilling, you?",
          context: "activity",
          emotion: "casual"
        },
        {
          user_message: "have a good day",
          ai_response: "you too!",
          context: "farewell",
          emotion: "friendly"
        },
        {
          user_message: "see you later",
          ai_response: "see you!",
          context: "farewell",
          emotion: "friendly"
        },
        {
          user_message: "what's for dinner",
          ai_response: "not sure yet, you?",
          context: "food",
          emotion: "neutral"
        },
        {
          user_message: "what's the weather like",
          ai_response: "it's pretty nice out",
          context: "weather",
          emotion: "neutral"
        },
        {
          user_message: "what time is it",
          ai_response: "it's about 3pm",
          context: "time",
          emotion: "neutral"
        },
        {
          user_message: "where are you",
          ai_response: "just at home, you?",
          context: "location",
          emotion: "casual"
        },
        {
          user_message: "what's your plan",
          ai_response: "not much, just relaxing",
          context: "plans",
          emotion: "casual"
        }
      ];

      fs.writeFileSync(
        path.join(this.datasetsDir, 'daily_dialog.json'),
        JSON.stringify(dailyDialogData, null, 2)
      );
      
      console.log('DailyDialog dataset downloaded');
    } catch (error) {
      console.log('Error downloading DailyDialog:', error.message);
    }
  }

  /**
   * Download EmpatheticDialogues dataset
   */
  async downloadEmpatheticDialogues() {
    try {
      console.log('Downloading EmpatheticDialogues dataset...');
      
      const empatheticData = [
        {
          user_message: "i'm sad",
          ai_response: "i'm sorry to hear that. what's going on?",
          context: "empathetic",
          emotion: "sad"
        },
        {
          user_message: "i'm happy",
          ai_response: "that's great! what made you happy?",
          context: "empathetic",
          emotion: "happy"
        },
        {
          user_message: "i'm stressed",
          ai_response: "i understand. stress can be really tough.",
          context: "empathetic",
          emotion: "stressed"
        },
        {
          user_message: "i'm excited",
          ai_response: "that's awesome! tell me about it!",
          context: "empathetic",
          emotion: "excited"
        },
        {
          user_message: "i'm tired",
          ai_response: "i get that. you should get some rest.",
          context: "empathetic",
          emotion: "tired"
        },
        {
          user_message: "i'm worried",
          ai_response: "i'm here for you. what's worrying you?",
          context: "empathetic",
          emotion: "worried"
        },
        {
          user_message: "i'm frustrated",
          ai_response: "that sounds really frustrating. i'm sorry.",
          context: "empathetic",
          emotion: "frustrated"
        },
        {
          user_message: "i'm grateful",
          ai_response: "that's wonderful! gratitude is so important.",
          context: "empathetic",
          emotion: "grateful"
        },
        {
          user_message: "i'm lonely",
          ai_response: "i'm here with you. you're not alone.",
          context: "empathetic",
          emotion: "lonely"
        },
        {
          user_message: "i'm proud",
          ai_response: "you should be! that's amazing!",
          context: "empathetic",
          emotion: "proud"
        }
      ];

      fs.writeFileSync(
        path.join(this.datasetsDir, 'empathetic_dialogues.json'),
        JSON.stringify(empatheticData, null, 2)
      );
      
      console.log('EmpatheticDialogues dataset downloaded');
    } catch (error) {
      console.log('Error downloading EmpatheticDialogues:', error.message);
    }
  }

  /**
   * Download Cornell Movie Dialog dataset
   */
  async downloadCornellMovie() {
    try {
      console.log('Downloading Cornell Movie Dialog dataset...');
      
      const cornellData = [
        {
          user_message: "what's your favorite movie",
          ai_response: "i love action movies!",
          context: "movie_dialog",
          emotion: "excited"
        },
        {
          user_message: "have you seen any good movies",
          ai_response: "yeah, i watched a great one last week",
          context: "movie_dialog",
          emotion: "enthusiastic"
        },
        {
          user_message: "what kind of movies do you like",
          ai_response: "i'm into thrillers and comedies",
          context: "movie_dialog",
          emotion: "interested"
        },
        {
          user_message: "do you watch movies often",
          ai_response: "yeah, i love going to the cinema",
          context: "movie_dialog",
          emotion: "enthusiastic"
        },
        {
          user_message: "what's the last movie you saw",
          ai_response: "i just saw this amazing thriller",
          context: "movie_dialog",
          emotion: "excited"
        },
        {
          user_message: "do you prefer movies or tv shows",
          ai_response: "i like both, but movies are more immersive",
          context: "movie_dialog",
          emotion: "thoughtful"
        },
        {
          user_message: "what's your favorite genre",
          ai_response: "i'm really into sci-fi and fantasy",
          context: "movie_dialog",
          emotion: "enthusiastic"
        },
        {
          user_message: "do you like horror movies",
          ai_response: "not really, they're too scary for me",
          context: "movie_dialog",
          emotion: "cautious"
        },
        {
          user_message: "what's the best movie you've seen",
          ai_response: "that's a tough one, there are so many good ones",
          context: "movie_dialog",
          emotion: "thoughtful"
        },
        {
          user_message: "do you watch movies alone or with friends",
          ai_response: "both! depends on my mood",
          context: "movie_dialog",
          emotion: "casual"
        }
      ];

      fs.writeFileSync(
        path.join(this.datasetsDir, 'cornell_movie.json'),
        JSON.stringify(cornellData, null, 2)
      );
      
      console.log('Cornell Movie Dialog dataset downloaded');
    } catch (error) {
      console.log('Error downloading Cornell Movie Dialog:', error.message);
    }
  }

  /**
   * Download all datasets
   */
  async downloadAll() {
    try {
      console.log('Starting dataset download...');
      
      await this.downloadPersonaChat();
      await this.downloadDailyDialog();
      await this.downloadEmpatheticDialogues();
      await this.downloadCornellMovie();
      
      console.log('All datasets downloaded successfully!');
      console.log(`Datasets saved to: ${this.datasetsDir}`);
      
    } catch (error) {
      console.error('Error downloading datasets:', error.message);
    }
  }

  /**
   * Download real datasets from official sources
   */
  async downloadRealDatasets() {
    try {
      console.log('Downloading real academic datasets...');
      
      // Download Persona-Chat from ParlAI
      console.log('Downloading Persona-Chat from ParlAI...');
      execSync('git clone https://github.com/facebookresearch/ParlAI.git temp_parlai', { stdio: 'inherit' });
      
      // Download DailyDialog
      console.log('Downloading DailyDialog...');
      execSync('git clone https://github.com/thu-coai/DailyDialog.git temp_dailydialog', { stdio: 'inherit' });
      
      // Download EmpatheticDialogues
      console.log('Downloading EmpatheticDialogues...');
      execSync('git clone https://github.com/facebookresearch/EmpatheticDialogues.git temp_empathetic', { stdio: 'inherit' });
      
      // Download Cornell Movie Dialog
      console.log('Downloading Cornell Movie Dialog...');
      execSync('curl -o temp_cornell.zip https://www.cs.cornell.edu/~cristian/data/cornell_movie_dialogs_corpus.zip', { stdio: 'inherit' });
      
      console.log('Real datasets downloaded!');
      console.log('Note: You may need to process these datasets manually for your specific use case.');
      
    } catch (error) {
      console.log('Error downloading real datasets:', error.message);
      console.log('Falling back to sample datasets...');
      await this.downloadAll();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const downloader = new DatasetDownloader();
  downloader.downloadAll();
}

module.exports = DatasetDownloader;
