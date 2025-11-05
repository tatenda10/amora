const pool = require('../../../db/connection');

/**
 * Match companions based on user preferences
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const matchCompanions = async (req, res) => {
  try {
    // Extract user profile and partner preferences from request body
    const { userProfile, partnerPreferences } = req.body;
    
    // Support both new structured format and legacy format
    const preferences = partnerPreferences || req.body;
    
    // Extract partner preferences
    const {
      age,
      gender,
      personalityTraits,
      interests,
      country,
      ethnicity
    } = preferences;

    console.log('=== MATCHING REQUEST ===');
    console.log('User Profile:', userProfile);
    console.log('Partner Preferences:', {
      age,
      gender,
      personalityTraits,
      interests,
      country,
      ethnicity
    });

    // Ensure we have arrays for personality traits and interests, even if empty
    const validPersonalityTraits = Array.isArray(personalityTraits) ? personalityTraits : [];
    const validInterests = Array.isArray(interests) ? interests : [];
    
    console.log('Valid personality traits:', validPersonalityTraits);
    console.log('Valid interests:', validInterests);

    // Get ALL companions first, then score them
    let query = 'SELECT * FROM companions WHERE 1=1';
    let queryParams = [];
    
    // Add filters for exact matches (but make them optional)
    if (gender && gender !== 'Any') {
      query += ' AND gender = ?';
      queryParams.push(gender);
    }
    
    if (country && country !== 'Any') {
      query += ' AND country = ?';
      queryParams.push(country);
    }
    
    if (ethnicity && ethnicity !== 'Any') {
      query += ' AND ethnicity = ?';
      queryParams.push(ethnicity);
    }
    
    // Add age range filter if provided (within 10 years for more flexibility)
    if (age) {
      const ageNum = parseInt(age);
      if (!isNaN(ageNum)) {
        query += ' AND age BETWEEN ? AND ?';
        queryParams.push(Math.max(18, ageNum - 10), ageNum + 10);
      }
    }
    
    console.log('Query:', query);
    console.log('Query params:', queryParams);
    
    // Execute the query
    const [companions] = await pool.execute(query, queryParams);
    console.log(`Found ${companions.length} companions after initial filtering`);
    
    // Process companions to parse JSON fields
    const processedCompanions = companions.map(companion => ({
      ...companion,
      traits: tryParseJSON(companion.traits, []),
      interests: tryParseJSON(companion.interests, [])
    }));
    
    console.log('Processed companions sample:', processedCompanions.slice(0, 2));
    
    // Calculate match score for each companion
    const scoredCompanions = processedCompanions.map(companion => {
      let score = 0;
      let scoreDetails = [];
      
      // Score personality traits matches
      const companionPersonality = companion.personality ? companion.personality.toLowerCase() : '';
      validPersonalityTraits.forEach(trait => {
        if (trait && companionPersonality.includes(trait.toLowerCase())) {
          score += 3; // Higher weight for personality match
          scoreDetails.push(`Personality trait "${trait}" matched: +3`);
        }
        
        // Also check traits array
        companion.traits.forEach(companionTrait => {
          if (trait && companionTrait && companionTrait.toLowerCase().includes(trait.toLowerCase())) {
            score += 2;
            scoreDetails.push(`Trait "${trait}" matched with "${companionTrait}": +2`);
          }
        });
      });
      
      // Score interests matches
      validInterests.forEach(interest => {
        if (!interest) return; // Skip empty interests
        
        companion.interests.forEach(companionInterest => {
          if (companionInterest && companionInterest.toLowerCase().includes(interest.toLowerCase())) {
            score += 2;
            scoreDetails.push(`Interest "${interest}" matched with "${companionInterest}": +2`);
          }
        });
      });
      
      // Bonus points for exact matches
      if (gender && gender !== 'Any' && companion.gender === gender) {
        score += 5;
        scoreDetails.push(`Gender match: +5`);
      }
      
      if (country && country !== 'Any' && companion.country === country) {
        score += 3;
        scoreDetails.push(`Country match: +3`);
      }
      
      if (ethnicity && ethnicity !== 'Any' && companion.ethnicity === ethnicity) {
        score += 3;
        scoreDetails.push(`Ethnicity match: +3`);
      }
      
      // Age proximity bonus (closer age = higher score)
      if (age && companion.age) {
        const ageDiff = Math.abs(parseInt(age) - companion.age);
        if (ageDiff <= 2) {
          score += 4;
          scoreDetails.push(`Age very close (${ageDiff} years): +4`);
        } else if (ageDiff <= 5) {
          score += 2;
          scoreDetails.push(`Age close (${ageDiff} years): +2`);
        } else if (ageDiff <= 10) {
          score += 1;
          scoreDetails.push(`Age within range (${ageDiff} years): +1`);
        }
      }
      
      // Base score for all companions (ensures we always have some matches)
      score += 1;
      scoreDetails.push(`Base score: +1`);
      
      console.log(`Companion "${companion.name}" - Total score: ${score}`);
      console.log('Score details:', scoreDetails);
      
      return {
        ...companion,
        match_score: score,
        score_details: scoreDetails
      };
    });
    
    // Sort by match score (descending)
    scoredCompanions.sort((a, b) => b.match_score - a.match_score);
    
    console.log('Top 5 scored companions:');
    scoredCompanions.slice(0, 5).forEach((companion, index) => {
      console.log(`${index + 1}. ${companion.name} - Score: ${companion.match_score}`);
    });
    
    // Always return at least 3 matches, or all available if less than 3
    const minMatches = 3;
    const topMatches = scoredCompanions.length >= minMatches 
      ? scoredCompanions.slice(0, Math.max(minMatches, scoredCompanions.length))
      : scoredCompanions;
    
    // If we don't have enough matches, add more from the remaining companions
    if (topMatches.length < minMatches && scoredCompanions.length > topMatches.length) {
      const remainingCompanions = scoredCompanions.slice(topMatches.length);
      const needed = minMatches - topMatches.length;
      topMatches.push(...remainingCompanions.slice(0, needed));
    }
    
    // If we still don't have enough matches, get more companions without filters
    if (topMatches.length < minMatches) {
      console.log(`Still need ${minMatches - topMatches.length} more matches, getting all companions`);
      const [allCompanions] = await pool.execute('SELECT * FROM companions LIMIT 50');
      
      const additionalCompanions = allCompanions
        .map(companion => ({
          ...companion,
          traits: tryParseJSON(companion.traits, []),
          interests: tryParseJSON(companion.interests, []),
          match_score: 1, // Base score
          score_details: ['Base score: +1 (fallback match)']
        }))
        .filter(companion => !topMatches.find(match => match.id === companion.id))
        .slice(0, minMatches - topMatches.length);
      
      topMatches.push(...additionalCompanions);
    }
    
    // If we don't have enough matches, add a note in the response
    const hasEnoughMatches = topMatches.length >= minMatches;
    
    console.log(`Final result: ${topMatches.length} matches (minimum: ${minMatches})`);
    console.log('=== END MATCHING ===');
    
    res.json({
      matches: topMatches,
      total_matches: scoredCompanions.length,
      has_enough_matches: hasEnoughMatches,
      user_profile: userProfile || null,
      partner_preferences: {
        age,
        gender,
        personalityTraits: validPersonalityTraits,
        interests: validInterests,
        country,
        ethnicity
      }
    });
  } catch (error) {
    console.error('Error matching companions:', error);
    res.status(500).json({ 
      message: 'Error matching companions', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Helper function to safely parse JSON
 * @param {string} jsonString - The JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
const tryParseJSON = (jsonString, defaultValue) => {
  if (!jsonString) return defaultValue;
  
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (e) {
    console.error('Error parsing JSON:', e.message, 'for string:', jsonString);
    return defaultValue;
  }
};

module.exports = {
  matchCompanions
};