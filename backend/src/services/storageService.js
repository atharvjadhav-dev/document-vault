/**
 * StorageService — Abstract storage operations for local disk or AWS S3.
 *
 * To migrate to S3:
 *   1. Set STORAGE_TYPE=s3 in .env
 *   2. Add AWS credentials to .env
 *   3. Uncomment the S3 methods below and install @aws-sdk/client-s3
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const s3 =
  STORAGE_TYPE === 's3'
    ? new S3Client({ region: process.env.AWS_REGION })
    : null;

// Ensure upload directory exists (local storage)
if (STORAGE_TYPE === 'local') {
  const absPath = path.resolve(UPLOAD_PATH);
  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath, { recursive: true });
    logger.info(`Upload directory created: ${absPath}`);
  }
}

class StorageService {
  /**
   * Save an uploaded file to storage.
   * @param {Object} file - Multer file object
   * @param {string} userId - Owner user ID
   * @returns {Promise<{filename, filePath, fileSize}>}
   */
  async saveFile(file, userId) {
    if (STORAGE_TYPE === 's3') {
      return this._saveToS3(file, userId);
    }
    return this._saveToLocal(file, userId);
  }

  /**
   * Delete a file from storage.
   * @param {string} filePath - Stored file path / S3 key
   */
  async deleteFile(filePath) {
    if (STORAGE_TYPE === 's3') {
      return this._deleteFromS3(filePath);
    }
    return this._deleteFromLocal(filePath);
  }

  /**
   * Get an absolute path / signed URL for file download.
   * @param {string} filePath - Stored path
   * @param {string} [originalFilename] - Original filename for the download header
   * @returns {Promise<string>}
   */
  async getDownloadPath(filePath, originalFilename) {
    if (STORAGE_TYPE === 's3') {
      return this._getS3SignedUrl(filePath, originalFilename);
    }
    return path.resolve(filePath);
  }

  // ── Local Storage ──────────────────────────────────────────────────────────

  async _saveToLocal(file, userId) {
    // File is already written by multer; just record metadata
    const absUploadPath = path.resolve(UPLOAD_PATH);
    const filePath = path.join(absUploadPath, file.filename);

    logger.info('File saved to local storage', {
      filename: file.filename,
      size: file.size,
      userId,
    });

    return {
      filename: file.filename,
      filePath,
      fileSize: file.size,
    };
  }

  async _deleteFromLocal(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('File deleted from local storage', { filePath });
      }
    } catch (error) {
      logger.error('Failed to delete file from local storage', {
        filePath,
        error: error.message,
      });
      throw error;
    }
  }

  // ── AWS S3 Storage ─────────────────────────────────────────────────────────
  // Uncomment and install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

  
  async _saveToS3(file, userId) {

    const key = `uploads/${userId}/${file.filename}`;
    const fileBuffer = fs.readFileSync(file.path);

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype,
    }));

    // Clean up temp local file
    fs.unlinkSync(file.path);

    return {
      filename: file.filename,
      filePath: key,         // S3 key stored as filePath
      fileSize: file.size,
    };
  }

  async _deleteFromS3(s3Key) {

    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    }));

    logger.info('File deleted from S3', { s3Key });
  }

  async _getS3SignedUrl(s3Key, originalFilename) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    if (originalFilename) {
      params.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(originalFilename)}"`;
    } else {
      params.ResponseContentDisposition = 'attachment';
    }

    return getSignedUrl(
      s3,
      new GetObjectCommand(params),
      { expiresIn: 3600 }   // 1 hour signed URL
    );
  }
}

module.exports = new StorageService();
