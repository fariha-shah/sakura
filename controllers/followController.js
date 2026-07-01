const Follow = require('../models/Follow');
const User = require('../models/User');

// ─── FOLLOW USER ──────────────────────────────────────────
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    // Check user exists
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't follow yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if already following
    const alreadyFollowing = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow
    await Follow.create({
      follower: req.user._id,
      following: req.params.id,
    });

    // Update counts
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { followingCount: 1 },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { followersCount: 1 },
    });

    res
      .status(201)
      .json({ message: `You are now following ${userToFollow.username}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UNFOLLOW USER ────────────────────────────────────────
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't unfollow yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    // Check if following
    const followRecord = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });

    if (!followRecord) {
      return res
        .status(400)
        .json({ message: 'You are not following this user' });
    }

    // Delete follow record
    await followRecord.deleteOne();

    // Update counts
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { followingCount: -1 },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { followersCount: -1 },
    });

    res.json({ message: `You unfollowed ${userToUnfollow.username}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET FOLLOWERS ────────────────────────────────────────
const getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id }).populate(
      'follower',
      'username fullName profilePicture'
    );

    res.json(followers.map((f) => f.follower));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET FOLLOWING ────────────────────────────────────────
const getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id }).populate(
      'following',
      'username fullName profilePicture'
    );

    res.json(following.map((f) => f.following));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── CHECK IF FOLLOWING ───────────────────────────────────
const checkFollowing = async (req, res) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id,
    });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
};
