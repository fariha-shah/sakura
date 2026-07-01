const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  addComment,
  getComments,
  deleteComment,
  likePost, // ← ADD
  unlikePost,
  getUserPosts,
  getTrending,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Post routes
router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/user/:userId', protect, getUserPosts);
router.get('/trending', protect, getTrending);
router.get('/:id', protect, getPostById);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
