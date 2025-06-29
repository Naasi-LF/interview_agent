const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error.util');
const User = require('../models/user.model');

/**
 * Middleware to verify user authentication
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'Not authorized, no token'));
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(createError(401, 'Not authorized, no token'));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
      // Add user to request
      req.user = decoded;
      next();
    } catch (error) {
      return next(createError(401, 'Not authorized, token failed'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify admin role
 */
exports.verifyAdmin = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(createError(403, 'Not authorized, admin access required'));
    }
    next();
  } catch (error) {
    next(error);
  }
};
