const axios = require('axios');

const testMatching = async () => {
  try {
    const testData = {
      userProfile: {
        age: 25,
        gender: "Female",
        personalityTraits: ["creative", "adventurous"],
        interests: ["art", "travel"],
        country: "United States",
        ethnicity: "Mixed"
      },
      partnerPreferences: {
        age: 27,
        gender: "Male",
        personalityTraits: ["intelligent", "kind"],
        interests: ["technology", "hiking"],
        country: "United States",
        ethnicity: "Any"
      }
    };

    console.log('Testing matching with data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/matching', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing matching:', error.response?.data || error.message);
  }
};

testMatching(); 