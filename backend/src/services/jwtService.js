const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET must be set and at least 32 characters long');
  process.exit(1);
}

/**
 * Generate a signed JWT for a user.
 * @param {Object} payload - { id, email }
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'document-vault',
    audience: 'document-vault-client',
  });
};

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'document-vault',
    audience: 'document-vault-client',
  });
};

module.exports = { generateToken, verifyToken };
