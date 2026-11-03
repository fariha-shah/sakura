const User = require('../models/User');
const Follow = require('../models/Follow');

// ─── GET USER PROFILE BY USERNAME ───────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET USER BY ID ───────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE YOUR OWN PROFILE ────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePicture, coverPhoto } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName !== undefined && fullName.trim() !== '') {
      user.fullName = fullName.trim();
    }
    if (bio !== undefined) {
      user.bio = bio.trim();
    }
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }
    if (coverPhoto !== undefined) {
      user.coverPhoto = coverPhoto;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      coverPhoto: updatedUser.coverPhoto,
      followersCount: updatedUser.followersCount,
      followingCount: updatedUser.followingCount,
      bookmarks: updatedUser.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SEARCH USERS ────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const search = req.query.search;
    if (!search || !search.trim()) {
      return res.json([]);
    }

    const keyword = {
      $or: [
        { username: { $regex: search.trim(), $options: 'i' } },
        { fullName: { $regex: search.trim(), $options: 'i' } },
      ],
    };

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    })
      .select('-password')
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET SUGGESTIONS (unfollowed users only) ─────────────
const getSuggestions = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.user._id });
    const followingIds = following.map((f) => f.following);

    const suggestions = await User.find({
      _id: {
        $nin: [...followingIds, req.user._id],
      },
    })
      .select('-password')
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(8);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  getUserById,
  updateProfile,
  searchUsers,
  getSuggestions,
};
