const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    // Content ya image mein se koi ek hona chahiye
    if (!content && !image) {
      return res
        .status(400)
        .json({ message: 'Please write something or add a photo!' });
    }

    const post = await Post.create({
      user: req.user._id,
      content: content || '',
      image: image || '',
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username fullName profilePicture'
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── GET ALL POSTS (FEED) ────────────────────────────────
const getPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET SINGLE POST ─────────────────────────────────────
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'user',
      'username fullName profilePicture'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE POST ─────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only owner can delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await post.deleteOne();

    // Delete all comments on this post too
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      content,
    });

    // Increment comments count on post
    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'username fullName profilePicture'
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET COMMENTS ─────────────────────────────────────────
const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE COMMENT ───────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment owner can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();

    // Decrement comments count
    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { commentsCount: -1 },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── LIKE POST ────────────────────────────────────────────
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    // Add user to likes array
    post.likes.push(req.user._id);
    post.likesCount += 1;
    await post.save();

    res.json({ message: 'Post liked', likesCount: post.likesCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UNLIKE POST ──────────────────────────────────────────
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if not liked yet
    const alreadyLiked = post.likes.includes(req.user._id);
    if (!alreadyLiked) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    // Remove user from likes array
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    post.likesCount -= 1;
    await post.save();

    res.json({ message: 'Post unliked', likesCount: post.likesCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── GET POSTS BY USER ID ─────────────────────────────────
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── GET TRENDING HASHTAGS ─────────────────────────────
const getTrending = async (req, res) => {
  try {
    const posts = await Post.find().select('content').limit(200);

    const hashtagCount = {};
    posts.forEach((post) => {
      const tags = post.content.match(/#\w+/g);
      if (tags) {
        tags.forEach((tag) => {
          const lower = tag.toLowerCase();
          hashtagCount[lower] = (hashtagCount[lower] || 0) + 1;
        });
      }
    });

    const trending = Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  addComment,
  getComments,
  deleteComment,
  likePost,
  unlikePost,
  getUserPosts,
  getTrending,
};
