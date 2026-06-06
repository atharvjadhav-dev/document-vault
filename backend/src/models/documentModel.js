const { query } = require('../config/database');

const VALID_CATEGORIES = [
  'Aadhaar', 'PAN', 'Passport', 'Education',
  'Resume', 'Certificates', 'Personal', 'Other',
];

const DocumentModel = {
  VALID_CATEGORIES,

  /**
   * Get all documents for a user with optional search/filter.
   */
  async findAllByUser(userId, { search, category } = {}) {
    let sql = `
      SELECT id, user_id, filename, original_filename, category,
             file_size, mime_type, uploaded_at, updated_at
      FROM documents
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (search) {
      sql += ` AND original_filename ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    sql += ' ORDER BY uploaded_at DESC';

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Get a single document by ID (must belong to user).
   */
  async findByIdAndUser(id, userId) {
    const result = await query(
      `SELECT id, user_id, filename, original_filename, category,
              file_path, file_size, mime_type, uploaded_at, updated_at
       FROM documents
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new document record.
   */
  async create({ userId, filename, originalFilename, category, filePath, fileSize, mimeType }) {
    const result = await query(
      `INSERT INTO documents
         (user_id, filename, original_filename, category, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, filename, original_filename, category,
                 file_size, mime_type, uploaded_at`,
      [userId, filename, originalFilename, category, filePath, fileSize, mimeType]
    );
    return result.rows[0];
  },

  /**
   * Update document metadata (rename / recategorize).
   */
  async update(id, userId, { originalFilename, category }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (originalFilename !== undefined) {
      updates.push(`original_filename = $${paramIndex}`);
      params.push(originalFilename.trim());
      paramIndex++;
    }

    if (category !== undefined && VALID_CATEGORIES.includes(category)) {
      updates.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (updates.length === 0) return null;

    params.push(id, userId);

    const result = await query(
      `UPDATE documents
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING id, original_filename, category, uploaded_at, updated_at`,
      params
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a document record.
   */
  async delete(id, userId) {
    const result = await query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id, file_path',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get storage stats for a user.
   */
  async getStats(userId) {
    const result = await query(
      `SELECT
         COUNT(*)::int AS total_documents,
         COALESCE(SUM(file_size), 0)::bigint AS total_size,
         COUNT(*) FILTER (WHERE uploaded_at > NOW() - INTERVAL '7 days')::int AS recent_uploads
       FROM documents
       WHERE user_id = $1`,
      [userId]
    );

    const categoryResult = await query(
      `SELECT category, COUNT(*)::int AS count
       FROM documents
       WHERE user_id = $1
       GROUP BY category
       ORDER BY count DESC`,
      [userId]
    );

    return {
      ...result.rows[0],
      categories: categoryResult.rows,
    };
  },

  /**
   * Get recent documents for a user (dashboard).
   */
  async getRecent(userId, limit = 5) {
    const result = await query(
      `SELECT id, original_filename, category, file_size, mime_type, uploaded_at
       FROM documents
       WHERE user_id = $1
       ORDER BY uploaded_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },
};

module.exports = DocumentModel;
