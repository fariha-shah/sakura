const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  editPost,
  deletePost,
  addComment,
  getComments,
  deleteComment,
  likePost,
  unlikePost,
  getUserPosts,
  getTrending,
  toggleBookmark,
  getBookmarkedPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Post static & collection routes (Must come before :id)
router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/trending', protect, getTrending);
router.get('/bookmarks', protect, getBookmarkedPosts);
router.get('/user/:userId', protect, getUserPosts);

// Single post parameterized routes
router.get('/:id', protect, getPostById);
router.put('/:id', protect, editPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.post('/:id/bookmark', protect, toggleBookmark);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
