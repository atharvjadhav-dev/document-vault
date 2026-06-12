const path = require('path');
const DocumentModel = require('../models/documentModel');
const storageService = require('../services/storageService');
const { sendSuccess, sendError, sanitizeFilename } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * GET /api/documents
 * List all documents for the authenticated user.
 */
const getDocuments = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const documents = await DocumentModel.findAllByUser(req.user.id, { search, category });

    return sendSuccess(res, { documents });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/documents
 * Upload a new document.
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded. Please attach a file.', 400);
    }

    const { category } = req.body;
    const originalFilename = sanitizeFilename(
      req.body.originalFilename || req.file.originalname
    );

    // Persist to storage (local or S3)
    const { filename, filePath, fileSize } = await storageService.saveFile(
      req.file,
      req.user.id
    );

    // Save document record in DB
    const document = await DocumentModel.create({
      userId: req.user.id,
      filename,
      originalFilename,
      category,
      filePath,
      fileSize,
      mimeType: req.file.mimetype,
    });

    logger.info('Document uploaded', {
      documentId: document.id,
      userId: req.user.id,
      filename,
      size: fileSize,
    });

    return sendSuccess(res, { document }, 'Document uploaded successfully.', 201);
  } catch (error) {
    // If DB write fails after file is saved, clean up the file
    if (req.file) {
      try {
        await storageService.deleteFile(req.file.path);
      } catch (cleanupError) {
        logger.error('Failed to clean up file after error', { error: cleanupError.message });
      }
    }
    next(error);
  }
};

/**
 * GET /api/documents/:id
 * Get document metadata by ID.
 */
const getDocument = async (req, res, next) => {
  try {
    const document = await DocumentModel.findByIdAndUser(req.params.id, req.user.id);
    if (!document) {
      return sendError(res, 'Document not found.', 404);
    }

    return sendSuccess(res, { document });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/documents/:id
 * Update document metadata (rename / recategorize).
 */
const updateDocument = async (req, res, next) => {
  try {
    const { originalFilename, category } = req.body;

    const updated = await DocumentModel.update(req.params.id, req.user.id, {
      originalFilename: originalFilename ? sanitizeFilename(originalFilename) : undefined,
      category,
    });

    if (!updated) {
      return sendError(res, 'Document not found or no changes made.', 404);
    }

    logger.info('Document updated', { documentId: req.params.id, userId: req.user.id });

    return sendSuccess(res, { document: updated }, 'Document updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/documents/:id
 * Delete a document and its file.
 */
const deleteDocument = async (req, res, next) => {
  try {
    const deleted = await DocumentModel.delete(req.params.id, req.user.id);
    if (!deleted) {
      return sendError(res, 'Document not found.', 404);
    }

    // Delete the actual file
    try {
      await storageService.deleteFile(deleted.file_path);
    } catch (fileError) {
      logger.error('Failed to delete file from storage', {
        filePath: deleted.file_path,
        error: fileError.message,
      });
      // DB record is already deleted — don't roll back
    }

    logger.info('Document deleted', { documentId: req.params.id, userId: req.user.id });

    return sendSuccess(res, null, 'Document deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documents/download/:id
 * Stream a document file to the client.
 */
const downloadDocument = async (req, res, next) => {
  try {
    const document = await DocumentModel.findByIdAndUser(req.params.id, req.user.id);
    if (!document) {
      return sendError(res, 'Document not found.', 404);
    }

    const downloadPath = await storageService.getDownloadPath(document.file_path);

    // Set headers for download
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(document.original_filename)}"`
    );
    res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');

    logger.info('Document downloaded', { documentId: document.id, userId: req.user.id });

    // For S3, downloadPath would be a signed URL — redirect
    if (downloadPath.startsWith('https://')) {
      return res.redirect(downloadPath);
    }

    // For local storage — stream the file
    return res.sendFile(downloadPath);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documents/stats
 * Get dashboard statistics for the user.
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await DocumentModel.getStats(req.user.id);
    const recent = await DocumentModel.getRecent(req.user.id, 5);

    return sendSuccess(res, { stats, recentDocuments: recent });
  } catch (error) {
    next(error);
  }
};

const getDownloadUrl = async (req, res, next) => {
  try {
    const document = await DocumentModel.findByIdAndUser(
      req.params.id,
      req.user.id
    );

    if (!document) {
      return sendError(res, 'Document not found.', 404);
    }

    const downloadUrl = await storageService.getDownloadPath(
      document.file_path
    );

    return res.json({
      success: true,
      downloadUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getStats,
  getDownloadUrl,
};
