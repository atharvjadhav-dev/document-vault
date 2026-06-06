const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/helpers');
const DocumentModel = require('../models/documentModel');

/**
 * Handle validation errors — returns 422 if any validation failed.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      'Validation failed. Please check your input.',
      422,
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────

const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters.')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Full name contains invalid characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email is too long.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];

// ── Document Validators ───────────────────────────────────────────────────────

const validateDocumentUpload = [
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isIn(DocumentModel.VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${DocumentModel.VALID_CATEGORIES.join(', ')}.`),

  handleValidationErrors,
];

const validateDocumentUpdate = [
  param('id')
    .isUUID().withMessage('Invalid document ID.'),

  body('originalFilename')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Filename must be 1–255 characters.')
    .matches(/^[^<>:"/\\|?*]+$/).withMessage('Filename contains invalid characters.'),

  body('category')
    .optional()
    .isIn(DocumentModel.VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${DocumentModel.VALID_CATEGORIES.join(', ')}.`),

  handleValidationErrors,
];

const validateDocumentId = [
  param('id')
    .isUUID().withMessage('Invalid document ID.'),

  handleValidationErrors,
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term too long.')
    .escape(),

  query('category')
    .optional()
    .isIn([...DocumentModel.VALID_CATEGORIES, ''])
    .withMessage('Invalid category filter.'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateDocumentUpload,
  validateDocumentUpdate,
  validateDocumentId,
  validateSearch,
};
