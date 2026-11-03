const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  searchUsers,
  getSuggestions,
  getUserById,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchUsers);
router.get('/', protect, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.put('/profile', protect, updateProfile);
router.get('/id/:id', protect, getUserById);
router.get('/profile/:username', getUserProfile);
router.get('/:username', getUserProfile);

module.exports = router;
