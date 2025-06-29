const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error.util');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { username, password, nickname } = req.body;
    
    // Check if username is provided
    if (!username) {
      return next(createError(400, 'Username is required'));
    }
    
    // Check if nickname is provided
    if (!nickname) {
      return next(createError(400, 'Nickname is required'));
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(createError(400, 'Username already exists'));
    }
    
    // Create new user with nickname and default role as 'user'
    const newUser = new User({ 
      username, 
      password, 
      nickname,
      role: 'user' // Ensure all registered users are 'user' by default
    });
    
    await newUser.save();
    
    const userWithoutPassword = { ...newUser.toObject() };
    delete userWithoutPassword.password;
    
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: userWithoutPassword 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(createError(401, 'Invalid credentials'));
    }

    // Remove password from response
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};
