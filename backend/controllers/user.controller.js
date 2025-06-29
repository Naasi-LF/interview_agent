const User = require('../models/user.model');
const { createError } = require('../utils/error.util');
const cloudinary = require('../utils/cloudinary');

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
    const { username, nickname, bio, avatarUrl, password, confirmPassword } = req.body;
    const updateData = {
      nickname,
      bio,
      updatedAt: Date.now()
    };
    
    // Handle username update if provided
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } // Exclude current user from check
      });
      
      if (existingUser) {
        return next(createError(400, 'Username already exists'));
      }
      
      updateData.username = username;
    }
    
    // Handle password update if provided
    if (password) {
      // Validate password confirmation
      if (!confirmPassword) {
        return next(createError(400, 'Password confirmation is required'));
      }
      
      if (password !== confirmPassword) {
        return next(createError(400, 'Passwords do not match'));
      }
      
      // Password will be hashed by the pre-save hook in the User model
      updateData.password = password;
    }

    // Handle image upload if avatarUrl is provided
    if (avatarUrl) {
      try {
        let imageUrl;
        
        if (avatarUrl.startsWith('data:image')) {
          // It's a base64 image, upload to Cloudinary
          console.log('Uploading base64 image to Cloudinary...');
          
          // Upload with optimization options
          const uploadResponse = await cloudinary.uploader.upload(avatarUrl, {
            folder: 'interview_platform_avatars',
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'limit' }, // Resize to max 500x500
              { quality: 'auto' } // Auto-optimize quality
            ]
          });
          
          imageUrl = uploadResponse.secure_url;
          console.log('Image uploaded successfully to Cloudinary');
        } else if (avatarUrl.startsWith('http')) {
          // It's already a URL, check if it's from our Cloudinary
          if (avatarUrl.includes('cloudinary.com')) {
            // It's already a Cloudinary URL, use as is
            imageUrl = avatarUrl;
          } else {
            // It's an external URL, upload to Cloudinary
            console.log('Uploading external image URL to Cloudinary...');
            const uploadResponse = await cloudinary.uploader.upload(avatarUrl, {
              folder: 'interview_platform_avatars',
              resource_type: 'image'
            });
            imageUrl = uploadResponse.secure_url;
          }
        } else {
          return next(createError(400, 'Invalid image format'));
        }
        
        // Set the secure URL from Cloudinary as the avatarUrl
        updateData.avatarUrl = imageUrl;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return next(createError(500, 'Error uploading image: ' + uploadError.message));
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
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
