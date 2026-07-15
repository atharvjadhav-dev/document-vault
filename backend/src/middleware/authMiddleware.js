const { verifyToken } = require('../services/jwtService');
const UserModel = require('../models/userModel');
const { sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Protect routes — validates Bearer JWT token.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please provide a valid token.', 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch fresh user data
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User not found. Token may be invalid.', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please log in again.', 401);
    }

    return sendError(res, 'Authentication failed.', 401);
  }
};

module.exports = { authenticate };
