const User = require('../models/user.model');
const { createError } = require('../utils/error.util');

/**
 * Get current user profile
 * @route GET /api/users/me
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(createError(404, 'User not found'));
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * @route PUT /api/users/me
 */
exports.updateCurrentUser = async (req, res, next) => {
  try {
    const { nickname, bio, avatarUrl } = req.body;
    
    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          nickname,
          bio,
          avatarUrl,
          updatedAt: Date.now()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return next(createError(404, 'User not found'));
    }
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
