const User = require('../models/User');
const Follow = require('../models/Follow');

// ─── GET USER PROFILE BY USERNAME ───────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
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

// ─── UPDATE YOUR OWN PROFILE ────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      followersCount: updatedUser.followersCount,
      followingCount: updatedUser.followingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SEARCH USERS ────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { fullName: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id }, // exclude yourself
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
    // Get all people I already follow
    const following = await Follow.find({ follower: req.user._id });
    const followingIds = following.map((f) => f.following);

    // Find users I don't follow + not myself
    const suggestions = await User.find({
      _id: {
        $nin: [...followingIds, req.user._id],
      },
    })
      .select('-password')
      .limit(5);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── GET USER BY ID ───────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  searchUsers,
  getSuggestions,
  getUserById,
};
