const express = require('express');
const router = express.Router();
const { 
  getCompanions, 
  getCompanion, 
  createCompanion, 
  updateCompanion, 
  deleteCompanion
} = require('../controllers/companions/companionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadFiles } = require('../middleware/uploadMiddleware');

// All routes are protected with JWT authentication
router.use(authenticateToken);

// Get all companions
router.get('/', getCompanions);

// Get single companion
router.get('/:id', getCompanion);

// Create new companion
router.post('/', uploadFiles, createCompanion);

// Update companion
router.put('/:id', uploadFiles, updateCompanion);

// Delete companion
router.delete('/:id', deleteCompanion);


module.exports = router;