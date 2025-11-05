const db = require('../../db/connection');
const openaiService = require('../../services/openaiService');

// Internal filtering function to reduce companions before AI matching
function filterCompanionsInternally(userData, companions) {
  const { age, looking_for, preferences } = userData;
  
  // Extract preferences
  const preferredAgeMin = looking_for.partner_age_min || 18;
  const preferredAgeMax = looking_for.partner_age_max || 50;
  const preferredGender = looking_for.partner_gender || 'any';
  const preferredCountry = looking_for.partner_country || null;
  const preferredEthnicity = preferences.ethnicity || null;

  // Internal filtering criteria

  const filtered = companions.filter(companion => {
    // Age filtering
    const ageMatch = companion.age >= preferredAgeMin && companion.age <= preferredAgeMax;
    
    // Gender filtering (case-insensitive and handle different formats)
    const genderMatch = preferredGender === 'any' || 
                       preferredGender.toLowerCase() === companion.gender.toLowerCase() ||
                       (preferredGender.toLowerCase() === 'female' && companion.gender.toLowerCase() === 'female') ||
                       (preferredGender.toLowerCase() === 'male' && companion.gender.toLowerCase() === 'male') ||
                       (preferredGender.toLowerCase() === 'non-binary' && companion.gender.toLowerCase() === 'non-binary');
    
    // Debug gender matching
    console.log(`Gender check for ${companion.name}: preferred="${preferredGender}" vs companion="${companion.gender}" -> ${genderMatch}`);
    
    // Country filtering (optional)
    const countryMatch = !preferredCountry || companion.country === preferredCountry;
    
    // Ethnicity filtering (optional)
    const ethnicityMatch = !preferredEthnicity || companion.ethnicity === preferredEthnicity;

    const passes = ageMatch && genderMatch && countryMatch && ethnicityMatch;
    
    console.log(`Companion ${companion.name} (${companion.gender}, ${companion.age}): age=${ageMatch}, gender=${genderMatch}, country=${countryMatch}, ethnicity=${ethnicityMatch} -> ${passes ? 'PASS' : 'FILTERED'}`);
    
    return passes;
  });

  // Filtering results
  
  return filtered;
}

// Get AI-powered companion matches for a user
const getCompanionMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    // Companion matching start

    // Get user profile information
    const userProfileQuery = `
      SELECT 
        u.id, u.name, u.email, u.profile_image_url,
        up.country, up.sex, up.age, up.interests, 
        up.looking_for, up.preferences, up.onboarding_completed
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `;

    const [userRows] = await db.execute(userProfileQuery, [userId]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User profile not found' 
      });
    }

    const userProfile = userRows[0];
    // User profile

    // Get all available companions
    const companionsQuery = 'SELECT * FROM companions ORDER BY created_at DESC';
    const [companionRows] = await db.execute(companionsQuery);
    // Available companions
    
    // Debug: Log first companion's data structure
    if (companionRows.length > 0) {
      // First companion data
    }

    if (companionRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No companions available' 
      });
    }

    // Helper function to safely parse JSON
    const safeJsonParse = (data, defaultValue = []) => {
      if (!data) return defaultValue;
      
      // If it's already an object or array, return it
      if (typeof data === 'object') {
        return data;
      }
      
      // If it's a string, try to parse it as JSON
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          // Ensure we return an array for interests and traits
          if (Array.isArray(parsed)) {
            return parsed;
          } else if (typeof parsed === 'string') {
            // If it's a comma-separated string, split it
            return parsed.split(',').map(item => item.trim()).filter(item => item);
          } else {
            return parsed; // Return the parsed object
          }
        } catch (error) {
          console.log('JSON parse error for:', data, 'Error:', error.message);
          // If it's a string that looks like comma-separated values, split it
          if (data.trim()) {
            return data.split(',').map(item => item.trim()).filter(item => item);
          }
          return defaultValue;
        }
      }
      
      return defaultValue;
    };

    // Prepare data for OpenAI
    const userData = {
      name: userProfile.name,
      country: userProfile.country,
      sex: userProfile.sex,
      age: userProfile.age,
      interests: safeJsonParse(userProfile.interests, []),
      looking_for: safeJsonParse(userProfile.looking_for, {}),
      preferences: safeJsonParse(userProfile.preferences, {})
    };

    const companionsData = companionRows.map(companion => {
      return {
        id: companion.id,
        name: companion.name,
        age: companion.age,
        country: companion.country,
        gender: companion.gender,
        ethnicity: companion.ethnicity,
        personality: companion.personality,
        traits: safeJsonParse(companion.traits, []),
        interests: safeJsonParse(companion.interests, []),
        backstory: companion.backstory,
        conversation_style: companion.conversation_style,
        profile_image_url: companion.profile_image_url,
        gallery_images: safeJsonParse(companion.gallery_images, [])
      };
    });

    // Debug: Log user preferences
    console.log('=== USER PREFERENCES DEBUG ===');
    console.log('User looking_for:', userData.looking_for);
    console.log('Preferred gender:', userData.looking_for.partner_gender);
    console.log('Preferred age range:', userData.looking_for.partner_age_min, '-', userData.looking_for.partner_age_max);
    console.log('Preferred country:', userData.looking_for.partner_country);
    console.log('Available companions genders:', companionsData.map(c => `${c.name}: ${c.gender}`));
    console.log('Raw user profile from DB:', JSON.stringify(userProfile, null, 2));
    console.log('=== END USER PREFERENCES DEBUG ===');

    // Stage 1: Internal filtering based on basic criteria
    let filteredCompanions = filterCompanionsInternally(userData, companionsData);
    console.log('Filtered companions count:', filteredCompanions.length);
    console.log('Filtered companions genders:', filteredCompanions.map(c => c.gender));

    // If no companions match all criteria, try with relaxed country filter (KEEP GENDER STRICT)
    if (filteredCompanions.length === 0) {
      console.log('No companions match all criteria, trying with relaxed country filter...');
      const relaxedUserData = {
        ...userData,
        looking_for: {
          ...userData.looking_for,
          partner_country: null // Remove country requirement, KEEP gender preference
        }
      };
      filteredCompanions = filterCompanionsInternally(relaxedUserData, companionsData);
      console.log('Relaxed filtered companions count:', filteredCompanions.length);
      console.log('Relaxed filtered companions genders:', filteredCompanions.map(c => c.gender));
    }

    // If still no matches, try with relaxed age range (expand by 5 years, KEEP GENDER STRICT)
    if (filteredCompanions.length === 0) {
      console.log('Still no matches, trying with relaxed age range...');
      const relaxedUserData = {
        ...userData,
        looking_for: {
          ...userData.looking_for,
          partner_country: null,
          partner_age_min: Math.max(18, parseInt(userData.looking_for.partner_age_min) - 5),
          partner_age_max: parseInt(userData.looking_for.partner_age_max) + 5
          // GENDER PREFERENCE STAYS STRICT - NO FALLBACK
        }
      };
      filteredCompanions = filterCompanionsInternally(relaxedUserData, companionsData);
      console.log('Age-relaxed filtered companions count:', filteredCompanions.length);
      console.log('Age-relaxed filtered companions genders:', filteredCompanions.map(c => c.gender));
    }

    // Stage 2: AI matching on filtered subset (max 8 companions)
    const companionsForAI = filteredCompanions.slice(0, 8);
    // Sending companions to AI

    // Create OpenAI prompt for matching
    const matchingPrompt = createMatchingPrompt(userData, companionsForAI);
    // OpenAI request

    // Get AI recommendations
    let aiResponse;
    try {
      aiResponse = await openaiService.generateResponse(matchingPrompt);
      // OpenAI response
    } catch (openaiError) {
      // OpenAI error
      throw openaiError;
    }

    // Parse AI response to get companion IDs
    const recommendedCompanionIds = parseAIResponse(aiResponse, companionsData);
    // Recommended companion IDs

    // Get the recommended companions
    const recommendedCompanions = companionsData.filter(companion => 
      recommendedCompanionIds.includes(companion.id)
    );

    // If we don't have 5 companions, fill with random ones (avoiding duplicates)
    if (recommendedCompanions.length < 5) {
      const usedIds = recommendedCompanionIds;
      const remainingCompanions = companionsData.filter(companion => 
        !usedIds.includes(companion.id)
      );
      
      // Shuffle and take additional companions
      const shuffled = remainingCompanions.sort(() => Math.random() - 0.5);
      const additionalCompanions = shuffled.slice(0, 5 - recommendedCompanions.length);
      
      recommendedCompanions.push(...additionalCompanions);
    }

    // Remove duplicates and limit to 5 companions
    const uniqueCompanions = recommendedCompanions.filter((companion, index, self) => 
      index === self.findIndex(c => c.id === companion.id)
    );
    
    // FINAL SAFETY CHECK: Ensure gender preference is respected (NO FALLBACK)
    const genderPreference = userData.looking_for.partner_gender;
    const finalCompanions = uniqueCompanions.filter(companion => {
      if (genderPreference === 'any') return true;
      return companion.gender.toLowerCase() === genderPreference.toLowerCase();
    }).slice(0, 5);
    
    console.log('Final companions after gender safety check:', finalCompanions.map(c => `${c.name} (${c.gender})`));

    // Final recommended companions

    res.json({
      success: true,
      companions: finalCompanions,
      total: finalCompanions.length,
      user_profile: {
        name: userData.name,
        country: userData.country,
        age: userData.age
      }
    });

  } catch (error) {
    // Companion matching error
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get companion matches',
      details: error.message,
      errorType: error.constructor.name
    });
  }
};

// Create the OpenAI prompt for companion matching
const createMatchingPrompt = (userData, companionsData) => {
  return `Match user with 5 best companions. Return ONLY JSON array of IDs [id1,id2,id3,id4,id5].

USER: ${userData.name}, ${userData.age}, ${userData.sex}, ${userData.country}
INTERESTS: ${userData.interests.join(', ')}
WANTS: ${userData.looking_for.partner_gender || 'any'} ${userData.looking_for.partner_age_min || 18}-${userData.looking_for.partner_age_max || 50}

COMPANIONS:
${companionsData.map(c => `${c.id}:${c.name},${c.age},${c.gender},${c.country} - ${c.personality} - ${c.interests.join(',')}`).join('\n')}

Rank by: shared interests, age compatibility, personality fit.`;
};

// Parse AI response to extract companion IDs
const parseAIResponse = (aiResponse, companionsData) => {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = aiResponse.match(/\[[\d,\s]+\]/);
    if (jsonMatch) {
      const ids = JSON.parse(jsonMatch[0]);
      return ids.filter(id => 
        companionsData.some(companion => companion.id === id)
      );
    }

    // Fallback: extract numbers from the response
    const numberMatches = aiResponse.match(/\d+/g);
    if (numberMatches) {
      return numberMatches
        .map(Number)
        .filter(id => companionsData.some(companion => companion.id === id))
        .slice(0, 5);
    }

    // If parsing fails, return empty array
    return [];
  } catch (error) {
    // Error parsing AI response
    return [];
  }
};

// Get user's current companion selection
const getUserCompanionSelection = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT ucs.*, c.name, c.age, c.gender, c.country, c.ethnicity, c.personality, 
             c.traits, c.interests, c.backstory, c.conversation_style, c.profile_image_url
      FROM user_companion_selections ucs
      JOIN companions c ON ucs.companion_id = c.id
      WHERE ucs.user_id = ?
      ORDER BY ucs.is_primary DESC, ucs.created_at DESC
    `;

    const [rows] = await db.execute(query, [userId]);

    res.json({
      success: true,
      selections: rows
    });

  } catch (error) {
    // Get companion selection error
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get companion selection' 
    });
  }
};

// Select a companion for the user
const selectCompanion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companion_id, is_primary = true } = req.body;

    if (!companion_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Companion ID is required' 
      });
    }

    // Check if companion exists
    const companionQuery = 'SELECT id FROM companions WHERE id = ?';
    const [companionRows] = await db.execute(companionQuery, [companion_id]);
    
    if (companionRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Companion not found' 
      });
    }

    // If this is set as primary, remove primary status from other selections
    if (is_primary) {
      await db.execute(
        'UPDATE user_companion_selections SET is_primary = false WHERE user_id = ?',
        [userId]
      );
    }

    // Insert or update companion selection
    const insertQuery = `
      INSERT INTO user_companion_selections (user_id, companion_id, is_primary)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary)
    `;

    await db.execute(insertQuery, [userId, companion_id, is_primary]);

    // Companion selected

    res.json({
      success: true,
      message: 'Companion selected successfully'
    });

  } catch (error) {
    // Select companion error
    res.status(500).json({ 
      success: false, 
      error: 'Failed to select companion' 
    });
  }
};

module.exports = {
  getCompanionMatches,
  getUserCompanionSelection,
  selectCompanion
};
