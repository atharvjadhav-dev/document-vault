const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendError } = require('../utils/helpers');
const { validateFileSignature } = require('../utils/fileValidator');
const logger = require('../utils/logger');

const UPLOAD_PATH = path.resolve(process.env.UPLOAD_PATH || './uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10 MB

// Allowed MIME types and their extensions
const ALLOWED_TYPES = {
  'application/pdf':                                              '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword':                                          '.doc',
  'image/jpeg':                                                  '.jpg',
  'image/png':                                                   '.png',
  'text/plain':                                                  '.txt',
};

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.txt'];

// Storage engine — saves to disk with a UUID filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter — double validation (extension + MIME type)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeAllowed = Object.keys(ALLOWED_TYPES).includes(file.mimetype);
  const extAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (mimeAllowed && extAllowed) {
    cb(null, true);
  } else {
    logger.warn('Rejected file upload', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      userId: req.user?.id,
    });
    cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Middleware wrapper that handles multer errors gracefully and performs
 * deep magic byte / file signature inspection to prevent MIME spoofing.
 */
const uploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(
            res,
            `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
            400
          );
        }
        return sendError(res, `Upload error: ${err.message}`, 400);
      }
      return sendError(res, err.message || 'File upload failed.', 400);
    }

    if (!req.file) {
      return next();
    }

    // ── Deep Magic Byte / File Signature Validation ──────────────────────────
    const validation = validateFileSignature(req.file.path, req.file.originalname);
    if (!validation.valid) {
      // Clean up the rejected file from disk immediately
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupErr) {
        logger.error('Failed to cleanup rejected file', { error: cleanupErr.message });
      }

      return sendError(res, validation.error, 400);
    }

    return next();
  });
};

module.exports = { uploadSingle, ALLOWED_TYPES, ALLOWED_EXTENSIONS };
