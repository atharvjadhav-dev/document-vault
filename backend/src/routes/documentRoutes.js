const express = require('express');
const {
  getDocuments,
  uploadDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getStats,
  getDownloadUrl,
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  validateDocumentUpload,
  validateDocumentUpdate,
  validateDocumentId,
  validateSearch,
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All document routes require authentication
router.use(authenticate);

// IMPORTANT: /stats and /download/:id must come BEFORE /:id
// to avoid Express treating "stats" and "download" as UUID params

router.get('/stats',          getStats);
router.get('/:id/download-url', authenticate, getDownloadUrl);
router.get('/download/:id',   validateDocumentId, downloadDocument);

router.get('/',               validateSearch,      getDocuments);
router.post('/',              uploadSingle('file'), validateDocumentUpload, uploadDocument);
router.get('/:id',            validateDocumentId,  getDocument);
router.put('/:id',            validateDocumentUpdate, updateDocument);
router.delete('/:id',         validateDocumentId,  deleteDocument);

module.exports = router;
