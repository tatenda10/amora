const pool = require('../../db/connection');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete file if it exists
const deleteFileIfExists = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    // File doesn't exist, ignore error
  }
};

/**
 * Get all companions with pagination and search
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCompanions = async (req, res) => {
  try {
    // Get pagination parameters from query string with validation
    const page = Math.max(1, parseInt(req.query.page) || 1); // Ensure page is at least 1
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10)); // Limit between 1 and 50
    const offset = (page - 1) * limit;
    const searchTerm = (req.query.search || '').trim();
    
    // Build the query based on search term
    let countQuery = 'SELECT COUNT(*) as total FROM companions';
    let dataQuery = 'SELECT * FROM companions';
    let queryParams = [];
    
    if (searchTerm) {
      // Add search conditions for multiple fields
      const searchCondition = 'WHERE name LIKE ? OR country LIKE ? OR ethnicity LIKE ?';
      countQuery += ' ' + searchCondition;
      dataQuery += ' ' + searchCondition;
      
      const searchPattern = `%${searchTerm}%`;
      queryParams = [searchPattern, searchPattern, searchPattern];
    }
    
    // Add ordering and pagination to data query
    dataQuery += ' ORDER BY created_at DESC';
    
    // Get total count for pagination metadata
    const [countResult] = await pool.execute(countQuery, searchTerm ? queryParams : []);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Add pagination directly to the query (safer than string replacement)
    dataQuery += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    // Get paginated companions
    const [companions] = await pool.execute(dataQuery, [...queryParams]);
    
    // Process data if needed (e.g., parse JSON strings)
    const processedCompanions = companions.map(companion => ({
      ...companion,
      traits: tryParseJSON(companion.traits, []),
      interests: tryParseJSON(companion.interests, []),
      gallery_images: tryParseJSON(companion.gallery_images, [])
    }));
    
    // Return paginated data with metadata
    res.json({
      data: processedCompanions,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching companions:', error);
    res.status(500).json({ 
      message: 'Error fetching companions', 
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
    return defaultValue;
  }
};

// Get single companion
const getCompanion = async (req, res) => {
  try {
    const [companions] = await pool.execute(
      'SELECT * FROM companions WHERE id = ?',
      [req.params.id]
    );

    if (companions.length === 0) {
      return res.status(404).json({ message: 'Companion not found' });
    }

    res.json(companions[0]);
  } catch (error) {
    console.error('Error fetching companion:', error);
    res.status(500).json({ message: 'Error fetching companion' });
  }
};

// Create companion
const createCompanion = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      country,
      ethnicity,
      personality,
      traits,
      interests,
      backstory
    } = req.body;

    // Log received data
    console.log('Received companion data:', {
      name,
      age,
      gender,
      country,
      ethnicity,
      personality,
      traits,
      interests,
      backstory,
      files: {
        profile: req.file,
        gallery: req.files
      }
    });

    // Validate required fields with detailed logging
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!gender) missingFields.push('gender');
    if (!personality) missingFields.push('personality');
    if (!traits) missingFields.push('traits');
    if (!interests) missingFields.push('interests');
    if (!backstory) missingFields.push('backstory');

    if (missingFields.length > 0) {
      console.log('Validation failed - missing fields:', missingFields);
      // Delete uploaded files if validation fails
      if (req.file) {
        await deleteFileIfExists(req.file.path);
      }
      if (req.files) {
        await Promise.all(req.files.map(file => deleteFileIfExists(file.path)));
      }
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Handle profile image
    const profile_image_url = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;

    // Handle gallery images
    const gallery_images = req.files ? 
      JSON.stringify(req.files.map(file => `/${file.path.replace(/\\/g, '/')}`)) : 
      null;

    // Log data being inserted
    console.log('Inserting companion with data:', {
      name,
      age: age || null,
      gender,
      country: country || null,
      ethnicity: ethnicity || null,
      personality,
      traits: typeof traits === 'string' ? traits : JSON.stringify(traits),
      interests: typeof interests === 'string' ? interests : JSON.stringify(interests),
      profile_image_url,
      gallery_images
    });

    // Insert into database
    const [result] = await pool.execute(
      `INSERT INTO companions (
        name, age, gender, country, ethnicity, personality, 
        traits, interests, backstory, profile_image_url, gallery_images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        age || null,
        gender,
        country || null,
        ethnicity || null,
        personality,
        typeof traits === 'string' ? traits : JSON.stringify(traits),
        typeof interests === 'string' ? interests : JSON.stringify(interests),
        backstory,
        profile_image_url,
        gallery_images
      ]
    );

    res.status(201).json({
      message: 'Companion created successfully',
      id: result.insertId
    });
  } catch (error) {
    // Delete uploaded files if database operation fails
    if (req.file) {
      await deleteFileIfExists(req.file.path);
    }
    if (req.files) {
      await Promise.all(req.files.map(file => deleteFileIfExists(file.path)));
    }
    console.error('Error creating companion:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({ message: 'Error creating companion', error: error.message });
  }
};

// Update companion
const updateCompanion = async (req, res) => {
  try {
    // Log received data
    console.log('\n=== UPDATE COMPANION REQUEST ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files);
    console.log('=== END REQUEST LOGGING ===\n');

    const {
      name,
      age,
      gender,
      country,
      ethnicity,
      personality,
      traits,
      interests,
      backstory,
      profile_image_url,
      existing_gallery
    } = req.body;

    // Validate required fields with detailed logging
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!gender) missingFields.push('gender');
    if (!personality) missingFields.push('personality');
    if (!traits) missingFields.push('traits');
    if (!interests) missingFields.push('interests');
    if (!backstory) missingFields.push('backstory');

    if (missingFields.length > 0) {
      console.log('Update validation failed - missing fields:', missingFields);
      // Delete uploaded files if validation fails
      if (req.files?.profile_image) {
        await deleteFileIfExists(req.files.profile_image[0].path);
      }
      if (req.files?.new_gallery_images) {
        await Promise.all(req.files.new_gallery_images.map(file => deleteFileIfExists(file.path)));
      }
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Get existing companion
    const [existing] = await pool.execute(
      'SELECT profile_image_url, gallery_images FROM companions WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      console.log('Update failed - companion not found:', req.params.id);
      return res.status(404).json({ message: 'Companion not found' });
    }

    // Handle profile image
    let final_profile_image_url = existing[0].profile_image_url;
    
    try {
      if (req.files?.profile_image) {
        // If new profile image uploaded
        if (final_profile_image_url) {
          console.log('Deleting old profile image:', final_profile_image_url);
          await deleteFileIfExists(path.join(__dirname, '..', '..', final_profile_image_url));
        }
        final_profile_image_url = `/uploads/companions/${req.files.profile_image[0].filename}`;
        console.log('New profile image path:', final_profile_image_url);
      } else if (profile_image_url) {
        // Keep existing profile image
        final_profile_image_url = profile_image_url;
      }
    } catch (error) {
      console.error('Error handling profile image:', error);
      return res.status(400).json({ message: 'Error processing profile image' });
    }

    // Handle gallery images
    let final_gallery_images = existing[0].gallery_images;
    
    try {
      if (existing_gallery) {
        // Parse existing gallery (it should be a JSON string array of URLs)
        const galleryUrls = JSON.parse(existing_gallery);
        
        // Filter out blob URLs and keep only file paths
        const validGalleryUrls = galleryUrls.filter(url => !url.startsWith('blob:'));
        
        final_gallery_images = JSON.stringify(validGalleryUrls);
      }

      if (req.files?.new_gallery_images) {
        // Add new gallery images to existing ones
        const currentGallery = final_gallery_images ? JSON.parse(final_gallery_images) : [];
        const newImages = req.files.new_gallery_images.map(file => 
          `/uploads/companions/${file.filename}`
        );
        final_gallery_images = JSON.stringify([...currentGallery, ...newImages]);
        console.log('Updated gallery images:', final_gallery_images);
      }
    } catch (error) {
      console.error('Error handling gallery images:', error);
      return res.status(400).json({ message: 'Error processing gallery images' });
    }

    // Update database
    try {
      await pool.execute(
        `UPDATE companions SET
          name = ?, age = ?, gender = ?, country = ?, ethnicity = ?,
          personality = ?, traits = ?, interests = ?, backstory = ?,
          profile_image_url = ?, gallery_images = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name,
          age || null,
          gender,
          country || null,
          ethnicity || null,
          personality,
          typeof traits === 'string' ? traits : JSON.stringify(traits),
          typeof interests === 'string' ? interests : JSON.stringify(interests),
          backstory,
          final_profile_image_url,
          final_gallery_images,
          req.params.id
        ]
      );

      res.json({ 
        message: 'Companion updated successfully',
        profile_image_url: final_profile_image_url,
        gallery_images: final_gallery_images
      });
    } catch (error) {
      console.error('Database error:', error);
      // Delete uploaded files if database operation fails
      if (req.files?.profile_image) {
        await deleteFileIfExists(req.files.profile_image[0].path);
      }
      if (req.files?.new_gallery_images) {
        await Promise.all(req.files.new_gallery_images.map(file => deleteFileIfExists(file.path)));
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating companion:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      companionId: req.params.id
    });
    res.status(500).json({ message: 'Error updating companion', error: error.message });
  }
};

// Delete companion
const deleteCompanion = async (req, res) => {
  try {
    // Get companion to delete files
    const [companions] = await pool.execute(
      'SELECT profile_image_url, gallery_images FROM companions WHERE id = ?',
      [req.params.id]
    );

    if (companions.length === 0) {
      return res.status(404).json({ message: 'Companion not found' });
    }

    const companion = companions[0];

    // Delete profile image
    if (companion.profile_image_url) {
      await deleteFileIfExists(path.join(__dirname, '..', companion.profile_image_url));
    }

    // Delete gallery images
    if (companion.gallery_images) {
      const gallery = JSON.parse(companion.gallery_images);
      await Promise.all(
        gallery.map(img => deleteFileIfExists(path.join(__dirname, '..', img)))
      );
    }

    // Delete from database
    await pool.execute('DELETE FROM companions WHERE id = ?', [req.params.id]);

    res.json({ message: 'Companion deleted successfully' });
  } catch (error) {
    console.error('Error deleting companion:', error);
    res.status(500).json({ message: 'Error deleting companion' });
  }
};



module.exports = {
  getCompanions,
  getCompanion,
  createCompanion,
  updateCompanion,
  deleteCompanion
};