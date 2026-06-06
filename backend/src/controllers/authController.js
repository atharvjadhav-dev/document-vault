const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { generateToken } = require('../services/jwtService');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Create a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if email already exists
    const emailTaken = await UserModel.emailExists(email);
    if (emailTaken) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserModel.create({ fullName, email, passwordHash });

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });

    logger.info('New user registered', { userId: user.id, email: user.email });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          createdAt: user.created_at,
        },
        token,
      },
      'Account created successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Use generic message to prevent user enumeration
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      logger.warn('Failed login attempt', { email });
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });

    logger.info('User logged in', { userId: user.id });

    return sendSuccess(res, {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return current authenticated user.
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, {
      user: {
        id: req.user.id,
        fullName: req.user.full_name,
        email: req.user.email,
        createdAt: req.user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
