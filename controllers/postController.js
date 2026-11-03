const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// ─── CREATE POST ──────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      return res
        .status(400)
        .json({ message: 'Please write something or add a photo!' });
    }

    const post = await Post.create({
      user: req.user._id,
      content: content ? content.trim() : '',
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
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
    const skip = (page - 1) * limit;

    let query = {};

    // Feed filter: following vs all
    if (req.query.feed === 'following') {
      const followingRecords = await Follow.find({ follower: req.user._id }).select('following');
      const followingIds = followingRecords.map((f) => f.following);
      // Include people you follow + your own posts
      query.user = { $in: [...followingIds, req.user._id] };
    }

    // Hashtag filter
    if (req.query.tag) {
      const tag = req.query.tag.replace(/^#/, '');
      query.content = { $regex: `#${tag}\\b`, $options: 'i' };
    }

    // Search query in posts
    if (req.query.search) {
      query.content = { $regex: req.query.search, $options: 'i' };
    }

    const posts = await Post.find(query)
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit) || 1,
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

// ─── EDIT POST ───────────────────────────────────────────
const editPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.content = content !== undefined ? content.trim() : post.content;
    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username fullName profilePicture'
    );

    res.json(populatedPost);
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

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    // Delete associated comments & notifications
    await Comment.deleteMany({ post: req.params.id });
    await Notification.deleteMany({ post: req.params.id });

    // Remove from all bookmarks
    await User.updateMany(
      { bookmarks: req.params.id },
      { $pull: { bookmarks: req.params.id } }
    );

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      content: content.trim(),
    });

    post.commentsCount += 1;
    await post.save();

    // Notify post author if commenter is someone else
    if (post.user.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'comment',
          post: post._id,
          text: `commented: "${content.trim().slice(0, 40)}${content.trim().length > 40 ? '...' : ''}"`,
        });
      } catch (err) {
        console.error('Notification error:', err.message);
      }
    }

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
      .sort({ createdAt: 1 });

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

    const post = await Post.findById(req.params.id);

    // Comment author or post author can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post && post.user.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

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

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user._id);
    post.likesCount = post.likes.length;
    await post.save();

    // Create notification if liking someone else's post
    if (post.user.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id,
          text: 'liked your post',
        });
      } catch (err) {
        console.error('Notification error:', err.message);
      }
    }

    res.json({ message: 'Post liked', likesCount: post.likesCount, isLiked: true });
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

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!alreadyLiked) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    post.likesCount = post.likes.length;
    await post.save();

    res.json({ message: 'Post unliked', likesCount: post.likesCount, isLiked: false });
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

// ─── GET TRENDING HASHTAGS ────────────────────────────────
const getTrending = async (req, res) => {
  try {
    const posts = await Post.find().select('content').sort({ createdAt: -1 }).limit(300);

    const hashtagCount = {};
    posts.forEach((post) => {
      if (!post.content) return;
      const tags = post.content.match(/#[a-zA-Z0-9_\u0600-\u06FF]+/g);
      if (tags) {
        tags.forEach((tag) => {
          const lower = tag.toLowerCase();
          hashtagCount[lower] = (hashtagCount[lower] || 0) + 1;
        });
      }
    });

    const trending = Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── TOGGLE BOOKMARK POST ─────────────────────────────────
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === postId.toString()
    );

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== postId.toString()
      );
    } else {
      user.bookmarks.push(postId);
    }

    await user.save();

    res.json({
      message: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      isBookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET BOOKMARKED POSTS ─────────────────────────────────
const getBookmarkedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: {
        path: 'user',
        select: 'username fullName profilePicture',
      },
    });

    const posts = (user.bookmarks || []).filter(Boolean);
    res.json(posts.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
