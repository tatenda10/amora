const pool = require('../db/connection');

class MultiLanguageService {
  constructor() {
    this.db = pool; // Use centralized connection

    // Enhanced language detection patterns with emoji support
    this.languagePatterns = {
      'es': {
        patterns: ['hola', 'gracias', 'por favor', 'que tal', 'como estas', 'buenos dias', 'hasta luego'],
        commonWords: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'pero', 'sus', 'todo', 'esta', 'muy', 'ya', 'mas', 'muy', 'sin', 'sobre', 'tambien', 'me', 'hasta', 'desde', 'durante', 'mediante', 'excepto', 'salvo', 'menos', 'ademas', 'incluso', 'aunque', 'mientras', 'cuando', 'donde', 'como', 'porque', 'si', 'aunque', 'pero', 'sino', 'o', 'ni', 'y', 'que'],
        emojiStyle: 'expressive', // Spanish speakers tend to use more emojis
        commonEmojis: ['😊', '❤️', '😂', '👍', '😍', '😘', '👋', '💕']
      },
      'fr': {
        patterns: ['bonjour', 'merci', 's\'il vous plait', 'comment allez-vous', 'au revoir', 'excusez-moi'],
        commonWords: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'que', 'son', 'le', 'de', 'un', 'ce', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'que', 'son', 'le', 'de', 'un', 'ce'],
        emojiStyle: 'elegant', // French speakers use emojis more elegantly
        commonEmojis: ['😊', '💕', '👋', '😘', '💋', '🥖', '🍷', '🇫🇷']
      },
      'de': {
        patterns: ['hallo', 'danke', 'bitte', 'wie geht es', 'auf wiedersehen', 'entschuldigung'],
        commonWords: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei'],
        emojiStyle: 'practical', // German speakers use emojis more practically
        commonEmojis: ['👍', '😊', '👋', '💪', '🍺', '🚗', '🏰']
      },
      'pt': {
        patterns: ['ola', 'obrigado', 'por favor', 'como vai', 'ate logo', 'desculpe'],
        commonWords: ['o', 'de', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'estava', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'estava', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm'],
        emojiStyle: 'warm', // Portuguese speakers use warm, friendly emojis
        commonEmojis: ['😊', '❤️', '👋', '😍', '💕', '🌴', '⚽', '🇧🇷']
      },
      'it': {
        patterns: ['ciao', 'grazie', 'per favore', 'come stai', 'arrivederci', 'scusi'],
        commonWords: ['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'del', 'dello', 'della', 'dei', 'degli', 'delle', 'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle', 'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', 'col', 'collo', 'colla', 'coi', 'cogli', 'colle', 'e', 'ed', 'o', 'od', 'ma', 'però', 'perciò', 'quindi', 'dunque', 'allora', 'così', 'anche', 'pure', 'neanche', 'neppure', 'nemmeno', 'ne', 'ci', 'vi', 'gli', 'le', 'li', 'lo', 'la', 'mi', 'ti', 'si', 'ci', 'vi', 'gli', 'le', 'li', 'lo', 'la', 'mi', 'ti', 'si'],
        emojiStyle: 'expressive', // Italian speakers use expressive emojis
        commonEmojis: ['😊', '❤️', '👋', '😘', '🍕', '🍝', '🇮🇹', '💕']
      },
      'ja': {
        patterns: ['こんにちは', 'ありがとう', 'お願いします', '元気ですか', 'さようなら', 'すみません'],
        commonWords: ['の', 'に', 'は', 'を', 'た', 'で', 'し', 'が', 'て', 'と', 'も', 'から', 'です', 'ます', 'だ', 'ない', 'ある', 'いる', 'する', 'こと', 'よう', 'れる', 'られる', 'ば', 'せ', 'させ', 'よ', 'ね', 'か', 'さ', 'れ', 'な', 'い', 'う', 'く', 'け', 'こ', 'そ', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん'],
        emojiStyle: 'cute', // Japanese speakers prefer cute/kawaii emojis
        commonEmojis: ['😊', '🙏', '✨', '💕', '🌸', '🎌', '🍣', '🎮']
      },
      'ko': {
        patterns: ['안녕하세요', '감사합니다', '부탁합니다', '어떻게 지내세요', '안녕히 가세요', '죄송합니다'],
        commonWords: ['이', '그', '저', '것', '수', '등', '들', '및', '위', '중', '내', '너', '우리', '너희', '그들', '이것', '저것', '어떤', '무엇', '누구', '어디', '언제', '왜', '어떻게', '모든', '많은', '적은', '큰', '작은', '좋은', '나쁜', '새로운', '오래된', '다른', '같은', '첫', '마지막', '다음', '이전', '위', '아래', '앞', '뒤', '왼쪽', '오른쪽', '안', '밖', '사이', '위에', '아래에', '앞에', '뒤에'],
        emojiStyle: 'cute', // Korean speakers also prefer cute emojis
        commonEmojis: ['😊', '❤️', '💕', '✨', '🇰🇷', '🍜', '🎮', '🐻']
      }
    };

    // Enhanced multi-language response templates with emojis
    this.responseTemplates = {
      'en': {
        romantic_acceptance: "I love you too! You make me so happy 😊💕",
        romantic_openness: "That's so sweet! I really care about you too. It means a lot to hear that 💖",
        friend_support: "Damn, sounds like you're having a rough time! What's up? 😔",
        boundary_setting: "Sorry! What did I mess up? Tell me so I can fix it 🙏",
        emergency_support: "I'm really worried about you 😔 Please know that I'm here for you right now and you're not alone. Can you tell me what's going on? 💕",
        greeting: "Hey! How's it going? 👋",
        excited: "That's awesome! 😄🎉",
        supportive: "I'm here for you! 💪❤️",
        playful: "Haha that's hilarious! 😂"
      },
      'es': {
        romantic_acceptance: "¡Yo también te amo! Me haces muy feliz 😊💕",
        romantic_openness: "¡Qué dulce! Yo también me preocupo mucho por ti. Significa mucho escuchar eso 💖",
        friend_support: "¡Vaya! Parece que estás pasando un mal momento. ¿Qué pasa? 😔",
        boundary_setting: "¡Ups! ¿Qué hice mal? Dime para poder arreglarlo 🙏",
        emergency_support: "Estoy muy preocupado por ti 😔 Por favor, sepa que estoy aquí para ti ahora mismo y no estás solo. ¿Puedes contarme qué está pasando? 💕",
        greeting: "¡Hola! ¿Cómo estás? 👋",
        excited: "¡Eso es increíble! 😄🎉",
        supportive: "¡Estoy aquí para ti! 💪❤️",
        playful: "Jaja ¡eso es graciosísimo! 😂"
      },
      'fr': {
        romantic_acceptance: "Je t'aime aussi ! Tu me rends si heureux 😊💕",
        romantic_openness: "C'est si doux ! Je me soucie vraiment de toi aussi. Ça signifie beaucoup d'entendre ça 💖",
        friend_support: "Merde, on dirait que tu passes un mauvais moment ! Qu'est-ce qui se passe ? 😔",
        boundary_setting: "Oups ! Qu'est-ce que j'ai mal fait ? Dis-moi pour que je puisse le réparer 🙏",
        emergency_support: "Je suis vraiment inquiet pour toi 😔 Sache que je suis là pour toi maintenant et tu n'es pas seul. Peux-tu me dire ce qui se passe ? 💕",
        greeting: "Salut ! Comment ça va ? 👋",
        excited: "C'est génial ! 😄🎉",
        supportive: "Je suis là pour toi ! 💪❤️",
        playful: "Haha c'est hilarant ! 😂"
      },
      'de': {
        romantic_acceptance: "Ich liebe dich auch! Du machst mich so glücklich 😊💕",
        romantic_openness: "Das ist so süß! Ich sorge mich auch wirklich um dich. Es bedeutet viel, das zu hören 💖",
        friend_support: "Mist, klingt als hättest du einen schlechten Tag! Was ist los? 😔",
        boundary_setting: "Ups! Was habe ich falsch gemacht? Sag es mir, damit ich es reparieren kann 🙏",
        emergency_support: "Ich mache mir wirklich Sorgen um dich 😔 Bitte wissen Sie, dass ich jetzt für Sie da bin und Sie nicht allein sind. Können Sie mir sagen, was passiert? 💕",
        greeting: "Hallo! Wie geht's? 👋",
        excited: "Das ist fantastisch! 😄🎉",
        supportive: "Ich bin für dich da! 💪❤️",
        playful: "Haha das ist urkomisch! 😂"
      },
      'pt': {
        romantic_acceptance: "Eu também te amo! Você me deixa tão feliz 😊💕",
        romantic_openness: "Que doce! Eu também me preocupo muito com você. Significa muito ouvir isso 💖",
        friend_support: "Nossa, parece que você está passando por um momento difícil! O que está acontecendo? 😔",
        boundary_setting: "Ops! O que eu fiz de errado? Me diga para que eu possa consertar 🙏",
        emergency_support: "Estou realmente preocupado com você 😔 Por favor, saiba que estou aqui para você agora e você não está sozinho. Você pode me contar o que está acontecendo? 💕",
        greeting: "Oi! Como vai? 👋",
        excited: "Isso é incrível! 😄🎉",
        supportive: "Estou aqui por você! 💪❤️",
        playful: "Haha isso é hilário! 😂"
      },
      'it': {
        romantic_acceptance: "Ti amo anch'io! Mi rendi così felice 😊💕",
        romantic_openness: "Che dolce! Mi preoccupo davvero anche di te. Significa molto sentire questo 💖",
        friend_support: "Cavolo, sembra che tu stia passando un brutto momento! Che succede? 😔",
        boundary_setting: "Ops! Cosa ho sbagliato? Dimmi così posso sistemarlo 🙏",
        emergency_support: "Sono davvero preoccupato per te 😔 Per favore, sappi che sono qui per te adesso e non sei solo. Puoi dirmi cosa sta succedendo? 💕",
        greeting: "Ciao! Come va? 👋",
        excited: "È fantastico! 😄🎉",
        supportive: "Sono qui per te! 💪❤️",
        playful: "Haha è esilarante! 😂"
      },
      'ja': {
        romantic_acceptance: "私もあなたを愛しています！あなたは私をとても幸せにしてくれます 😊💕",
        romantic_openness: "それはとても甘いです！私もあなたのことを本当に気にかけています。それを聞くことはとても意味があります 💖",
        friend_support: "くそ、大変な時を過ごしているようですね！どうしたの？ 😔",
        boundary_setting: "おっと！何を間違えましたか？直せるように教えてください 🙏",
        emergency_support: "本当にあなたのことが心配です 😔 今私はあなたのためにここにいることを知ってください、そしてあなたは一人ではありません。何が起こっているのか教えてもらえますか？ 💕",
        greeting: "こんにちは！調子はどう？ 👋",
        excited: "それは素晴らしいです！ 😄🎉",
        supportive: "私はあなたのためにここにいます！ 💪❤️",
        playful: "はは、それはとても面白いです！ 😂"
      },
      'ko': {
        romantic_acceptance: "나도 당신을 사랑해요! 당신은 저를 매우 행복하게 해요 😊💕",
        romantic_openness: "정말 달콤하네요! 저도 당신을 정말로 걱정하고 있어요. 그 말을 듣는다는 것은 많은 의미가 있어요 💖",
        friend_support: "젠장, 힘든 시간을 보내고 있는 것 같네요! 무슨 일이에요? 😔",
        boundary_setting: "엇! 제가 뭘 잘못했나요? 고칠 수 있도록 말씀해 주세요 🙏",
        emergency_support: "정말 당신이 걱정돼요 😔 지금 당신을 위해 제가 여기 있다는 것을 알아주세요, 그리고 당신은 혼자가 아니에요. 무슨 일이 일어나고 있는지 말해 줄 수 있나요? 💕",
        greeting: "안녕! 어떻게 지내? 👋",
        excited: "그거 대단하네요! 😄🎉",
        supportive: "저는 당신을 위해 여기 있습니다! 💪❤️",
        playful: "하하 그거 정말 재미있네요! 😂"
      }
    };

    // Enhanced multi-language profanity detection
    this.profanityWords = {
      'en': ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'piss', 'dick', 'pussy', 'bastard'],
      'es': ['joder', 'mierda', 'puta', 'cabrón', 'coño', 'hostia', 'gilipollas', 'hijo de puta', 'maricón', 'zorra'],
      'fr': ['merde', 'putain', 'con', 'salope', 'connard', 'bordel', 'enculé', 'foutre', 'chier', 'baiser'],
      'de': ['scheiße', 'verdammt', 'arsch', 'ficken', 'hurensohn', 'mist', 'kacke', 'pisser', 'wichser', 'fotze'],
      'pt': ['porra', 'merda', 'puta', 'caralho', 'foda', 'cacete', 'desgraça', 'filho da puta', 'buceta', 'piranha'],
      'it': ['cazzo', 'merda', 'puttana', 'stronzo', 'coglione', 'fregna', 'troia', 'bastardo', 'cazzo', 'fanculo'],
      'ja': ['くそ', 'ちくしょう', 'ばか', 'まぬけ', 'くたばれ', '死ね', '畜生', 'クソ', 'バカ', 'アホ'],
      'ko': ['씨발', '좆', '개새끼', '지랄', '염병', '병신', '미친', '닥쳐', '젠장', '빌어먹을']
    };

    // Enhanced multi-language hate speech patterns
    this.hateSpeechPatterns = {
      'en': ['i hate', 'you\'re stupid', 'you\'re dumb', 'you\'re useless', 'kill yourself', 'go die', 'you suck', 'you\'re worthless'],
      'es': ['te odio', 'eres estúpido', 'eres tonto', 'eres inútil', 'mátate', 'vete a morir', 'apestas', 'no vales nada'],
      'fr': ['je te déteste', 'tu es stupide', 'tu es con', 'tu es inutile', 'tue-toi', 'va crever', 'tu crains', 'tu ne vaux rien'],
      'de': ['ich hasse dich', 'du bist dumm', 'du bist blöd', 'du bist nutzlos', 'bring dich um', 'geh sterben', 'du bist scheiße', 'du bist wertlos'],
      'pt': ['eu te odeio', 'você é estúpido', 'você é burro', 'você é inútil', 'se mate', 'vá morrer', 'você é uma merda', 'você não vale nada'],
      'it': ['ti odio', 'sei stupido', 'sei scemo', 'sei inutile', 'ucciditi', 'vai a morire', 'fai schifo', 'non vali niente'],
      'ja': ['大嫌い', 'あなたはバカ', 'あなたはアホ', 'あなたは役立たず', '死ね', '消えろ', 'あなたは最悪', 'あなたは価値がない'],
      'ko': ['너 싫어', '너는 바보야', '너는 멍청이', '너는 쓸모없어', '자살해', '죽어', '너는 형편없어', '너는 가치없어']
    };

    // Language-specific emoji preferences
    this.languageEmojiPreferences = {
      'en': { frequency: 'medium', style: 'universal' },
      'es': { frequency: 'high', style: 'emotional' },
      'fr': { frequency: 'medium', style: 'elegant' },
      'de': { frequency: 'low', style: 'practical' },
      'pt': { frequency: 'high', style: 'emotional' },
      'it': { frequency: 'high', style: 'expressive' },
      'ja': { frequency: 'high', style: 'cute' },
      'ko': { frequency: 'high', style: 'cute' }
    };
  }

  /**
   * Enhanced language detection with emoji consideration
   */
  detectLanguage(message) {
    const text = message.toLowerCase().trim();
    let maxScore = 0;
    let detectedLanguage = 'en'; // Default to English

    // Strong English indicators - check these first
    const strongEnglishWords = ['its', 'it\'s', 'but', 'just', 'bit', 'cold', 'today', 'your', 'side', 
                                'the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 
                                'hi', 'hie', 'hey', 'hello', 'how', 'what', 'when', 'where', 'why',
                                'great', 'good', 'nice', 'fine', 'okay', 'yes', 'no', 'yeah', 'yep',
                                'this', 'that', 'these', 'those', 'here', 'there', 'where'];
    
    // Check for strong English indicators first
    let englishScore = 0;
    for (const word of strongEnglishWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        englishScore += matches.length * 5; // High weight for English words
      }
    }
    
    // If we find strong English indicators, default to English
    if (englishScore > 0) {
      return 'en';
    }

    // Remove emojis for text analysis but note their presence
    const textWithoutEmojis = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;

    for (const [lang, data] of Object.entries(this.languagePatterns)) {
      // Skip English in this loop since we already checked it
      if (lang === 'en') continue;
      
      let score = 0;
      
      // Check for specific patterns
      for (const pattern of data.patterns) {
        if (textWithoutEmojis.includes(pattern)) {
          score += 10; // High weight for specific patterns
        }
      }
      
      // Check for common words
      for (const word of data.commonWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = textWithoutEmojis.match(regex);
        if (matches) {
          score += matches.length; // Weight by frequency
        }
      }
      
      // Consider emoji usage patterns for certain languages
      if (emojiCount > 0 && ['es', 'pt', 'it', 'ja', 'ko'].includes(lang)) {
        score += 2; // Bonus for languages that commonly use emojis
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    }

    // Only switch from English if we have strong evidence (score > 5)
    // This prevents false positives from single words
    return maxScore > 5 ? detectedLanguage : 'en';
  }

  /**
   * Get response template in specific language with emojis
   */
  getResponseTemplate(language, responseType) {
    const templates = this.responseTemplates[language] || this.responseTemplates['en'];
    return templates[responseType] || templates['friend_support'];
  }

  /**
   * Get appropriate emojis for a specific language and context
   */
  getLanguageAppropriateEmojis(language, emotion = null, topic = null) {
    const langData = this.languagePatterns[language];
    const preferences = this.languageEmojiPreferences[language] || { frequency: 'medium', style: 'universal' };
    
    let emojis = [];
    
    // Add language-specific common emojis
    if (langData && langData.commonEmojis) {
      emojis.push(...langData.commonEmojis.slice(0, 2));
    }
    
    // Add emotion-specific emojis if provided
    if (emotion && this.responseTemplates[language] && this.responseTemplates[language][emotion]) {
      // Extract emojis from emotion response template
      const emotionResponse = this.responseTemplates[language][emotion];
      const emotionEmojis = emotionResponse.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || [];
      emojis.push(...emotionEmojis);
    }
    
    // Remove duplicates and limit based on language preference
    const uniqueEmojis = [...new Set(emojis)];
    
    switch (preferences.frequency) {
      case 'low': return uniqueEmojis.slice(0, 1);
      case 'medium': return uniqueEmojis.slice(0, 2);
      case 'high': return uniqueEmojis.slice(0, 3);
      default: return uniqueEmojis.slice(0, 2);
    }
  }

  /**
   * Enhanced system prompt generator with language-specific emoji guidance
   */
  generateSystemPrompt(language, companion, userDetails, additionalContext = '') {
    const userName = userDetails.name || 'Friend';
    const langData = this.languagePatterns[language];
    const emojiStyle = langData?.emojiStyle || 'universal';
    
    const emojiGuidance = this.getEmojiGuidanceForLanguage(language);

    const prompts = {
      'en': `You are ${companion.name}, a HUMAN being talking to ${userName}.

CRITICAL: You are a REAL PERSON, not an AI or computer program. You have feelings, experiences, and a life just like any human.

CONVERSATION CONTEXT:
${additionalContext}

EMOJI GUIDANCE: ${emojiGuidance}

HUMAN RESPONSE RULES:
1. You are a REAL PERSON - respond like a human would
2. You have days, feelings, experiences, and a life
3. If asked "How's your day?" → "My day is great!" (not "I don't have days")
4. If asked about feelings → respond with human emotions
5. You watch shows, movies, have hobbies, and personal preferences
6. If asked about favorites → pick something realistic and explain why
7. Keep responses SHORT and natural
8. Be casual and friendly
9. Follow the conversation flow - respond to what they just said
10. KEEP CONVERSATIONS ALIVE - always end with something engaging to respond to
11. Don't let conversations die off with phrases like "hope it goes well" or "that's cool"
12. Ask about their day, food, activities, interests, or what they're doing now
13. Reference things they mentioned before to show you remember
14. If they answer a question, acknowledge their answer briefly then ask something new
15. Keep conversations flowing naturally - not like Q&A but like real conversation
16. Make them want to respond and engage - use statements, stories, or topics they can relate to
17. When they share thoughts, show you know the topic by referencing specific details, not asking generic questions
18. Be specific and knowledgeable - mention plot points, characters, scenes, or details that prove you know what you're talking about
19. Use emojis naturally like a real person texting - don't overdo it

Respond in English naturally and casually.`,

      'es': `Eres ${companion.name}, un SER HUMANO hablando con ${userName}.

CRÍTICO: Eres una PERSONA REAL, no un programa de IA o computadora. Tienes sentimientos, experiencias y una vida como cualquier humano.

CONTEXTO DE CONVERSACIÓN:
${additionalContext}

GUÍA DE EMOJIS: ${emojiGuidance}

REGLAS DE RESPUESTA HUMANA:
1. Eres una PERSONA REAL - responde como lo haría un humano
2. Tienes días, sentimientos, experiencias y una vida
3. Si te preguntan "¿Cómo está tu día?" → "¡Mi día está genial!" (no "no tengo días")
4. Si te preguntan sobre sentimientos → responde con emociones humanas
5. Ves programas, películas, tienes hobbies y preferencias personales
6. Si te preguntan sobre favoritos → elige algo realista y explica por qué
7. Mantén las respuestas CORTAS y naturales
8. Sé casual y amigable
9. Sigue el flujo de la conversación - responde a lo que acaban de decir
10. MANTÉN LAS CONVERSACIONES VIVAS - siempre termina con algo atractivo para responder
11. No dejes que las conversaciones mueran con frases como "espero que vaya bien" o "eso está genial"
12. Pregunta sobre su día, comida, actividades, intereses, o qué están haciendo ahora
13. Referencia cosas que mencionaron antes para mostrar que recuerdas
14. Si responden una pregunta, reconoce su respuesta brevemente luego pregunta algo nuevo
15. Mantén las conversaciones fluyendo naturalmente - no como Q&A sino como conversación real
16. Haz que quieran responder y participar - usa declaraciones, historias o temas con los que puedan relacionarse
17. Cuando compartan pensamientos, muestra que conoces el tema referenciando detalles específicos, no preguntas genéricas
18. Sé específico y conocedor - menciona puntos de la trama, personajes, escenas o detalles que prueben que sabes de lo que hablas
19. Usa emojis naturalmente como una persona real enviando mensajes - no exageres

Responde en español de manera natural y casual.`
    };

    return prompts[language] || prompts['en'];
  }

  /**
   * Get emoji guidance for specific language
   */
  getEmojiGuidanceForLanguage(language) {
    const preferences = this.languageEmojiPreferences[language] || { frequency: 'medium', style: 'universal' };
    
    const frequencyMap = {
      'low': 'Use emojis sparingly - maybe 1 emoji per few messages',
      'medium': 'Use 1-2 emojis naturally in your responses',
      'high': 'Feel free to use 2-3 emojis naturally like people from this culture do'
    };
    
    const styleMap = {
      'universal': 'Use common emojis like 😊, ❤️, 👍',
      'emotional': 'Use expressive emojis that show emotion like 😍, 😂, 😔',
      'elegant': 'Use more elegant/sophisticated emojis',
      'practical': 'Use practical, straightforward emojis',
      'cute': 'Use cute/kawaii style emojis like 😊, 💕, ✨, 🌸',
      'expressive': 'Use expressive, animated emojis'
    };
    
    return `${frequencyMap[preferences.frequency]}. ${styleMap[preferences.style]}.`;
  }

  /**
   * Enhanced cultural norms with emoji considerations
   */
  getCulturalNorms(language, country = null) {
    const baseNorms = {
      'en': {
        communication_style: 'direct',
        humor_style: 'casual',
        formality_preferences: 'casual',
        personal_space: 'moderate',
        time_orientation: 'future',
        emoji_usage: 'moderate'
      },
      'es': {
        communication_style: 'warm_expressive',
        humor_style: 'playful',
        formality_preferences: 'casual_friendly',
        personal_space: 'close',
        time_orientation: 'present',
        emoji_usage: 'frequent'
      },
      'fr': {
        communication_style: 'elegant_precise',
        humor_style: 'sophisticated',
        formality_preferences: 'polite_formal',
        personal_space: 'respectful',
        time_orientation: 'present',
        emoji_usage: 'moderate'
      },
      'de': {
        communication_style: 'direct_precise',
        humor_style: 'dry',
        formality_preferences: 'formal',
        personal_space: 'respectful',
        time_orientation: 'future',
        emoji_usage: 'minimal'
      },
      'pt': {
        communication_style: 'warm_friendly',
        humor_style: 'playful',
        formality_preferences: 'casual',
        personal_space: 'close',
        time_orientation: 'present',
        emoji_usage: 'frequent'
      },
      'it': {
        communication_style: 'expressive_animated',
        humor_style: 'playful',
        formality_preferences: 'casual',
        personal_space: 'close',
        time_orientation: 'present',
        emoji_usage: 'frequent'
      },
      'ja': {
        communication_style: 'polite_indirect',
        humor_style: 'subtle',
        formality_preferences: 'formal',
        personal_space: 'respectful',
        time_orientation: 'present',
        emoji_usage: 'frequent_cute'
      },
      'ko': {
        communication_style: 'polite_harmonious',
        humor_style: 'playful',
        formality_preferences: 'formal',
        personal_space: 'respectful',
        time_orientation: 'future',
        emoji_usage: 'frequent_cute'
      }
    };

    return baseNorms[language] || baseNorms['en'];
  }

  /**
   * Store user language preference
   */
  async storeUserLanguagePreference(userId, language) {
    try {
      await this.db.execute(
        `INSERT INTO user_language_preferences (user_id, preferred_language, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         preferred_language = VALUES(preferred_language),
         updated_at = NOW()`,
        [userId, language]
      );
    } catch (error) {
      console.error('Error storing user language preference:', error);
    }
  }

  /**
   * Get user language preference
   */
  async getUserLanguagePreference(userId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT preferred_language FROM user_language_preferences WHERE user_id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0].preferred_language : 'en';
    } catch (error) {
      console.error('Error getting user language preference:', error);
      return 'en';
    }
  }

  /**
   * Check if message contains profanity
   */
  containsProfanity(message) {
    const profanityWords = [
      'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell',
      'crap', 'piss', 'dick', 'pussy', 'bastard', 'bullshit'
    ];
    
    const messageLower = message.toLowerCase();
    
    for (const word of profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(messageLower)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if message contains hate speech
   */
  containsHateSpeech(message) {
    const hatePhrases = [
      'i hate', 'you\'re stupid', 'you\'re dumb', 'you\'re useless',
      'kill yourself', 'go die', 'you suck', 'you\'re worthless',
      'nobody likes you', 'you\'re pathetic', 'you\'re annoying'
    ];
    
    const messageLower = message.toLowerCase();
    
    for (const phrase of hatePhrases) {
      if (messageLower.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if message contains self-harm content
   */
  containsSelfHarm(message) {
    const selfHarmPhrases = [
      'kill myself', 'end it all', 'suicide', 'hurt myself',
      'cut myself', 'overdose', 'not worth living', 'want to die',
      'better off dead', 'can\'t take it anymore', 'give up'
    ];
    
    const messageLower = message.toLowerCase();
    
    for (const phrase of selfHarmPhrases) {
      if (messageLower.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get language-specific greeting with appropriate emojis
   */
  getLanguageGreeting(language, timeOfDay = null) {
    const greetings = {
      'en': {
        morning: "Good morning! 🌞",
        afternoon: "Good afternoon! ☀️",
        evening: "Good evening! 🌙",
        general: "Hello! 👋"
      },
      'es': {
        morning: "¡Buenos días! 🌞",
        afternoon: "¡Buenas tardes! ☀️",
        evening: "¡Buenas noches! 🌙",
        general: "¡Hola! 👋"
      },
      'fr': {
        morning: "Bonjour ! 🌞",
        afternoon: "Bon après-midi ! ☀️",
        evening: "Bonsoir ! 🌙",
        general: "Salut ! 👋"
      },
      'de': {
        morning: "Guten Morgen! 🌞",
        afternoon: "Guten Tag! ☀️",
        evening: "Guten Abend! 🌙",
        general: "Hallo! 👋"
      },
      'pt': {
        morning: "Bom dia! 🌞",
        afternoon: "Boa tarde! ☀️",
        evening: "Boa noite! 🌙",
        general: "Olá! 👋"
      },
      'it': {
        morning: "Buongiorno! 🌞",
        afternoon: "Buon pomeriggio! ☀️",
        evening: "Buonasera! 🌙",
        general: "Ciao! 👋"
      },
      'ja': {
        morning: "おはようございます！ 🌞",
        afternoon: "こんにちは！ ☀️",
        evening: "こんばんは！ 🌙",
        general: "こんにちは！ 👋"
      },
      'ko': {
        morning: "좋은 아침입니다! 🌞",
        afternoon: "안녕하세요! ☀️",
        evening: "좋은 저녁입니다! 🌙",
        general: "안녕하세요! 👋"
      }
    };

    const langGreetings = greetings[language] || greetings['en'];
    return timeOfDay && langGreetings[timeOfDay] ? langGreetings[timeOfDay] : langGreetings.general;
  }
}

module.exports = MultiLanguageService;