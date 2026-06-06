const { query } = require('../config/database');

const UserModel = {
  /**
   * Find a user by email (for login).
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID (for auth middleware).
   */
  async findById(id) {
    const result = await query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ fullName, email, passwordHash }) {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
      [fullName.trim(), email.toLowerCase().trim(), passwordHash]
    );
    return result.rows[0];
  },

  /**
   * Check if an email is already registered.
   */
  async emailExists(email) {
    const result = await query(
      'SELECT 1 FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rowCount > 0;
  },
};

module.exports = UserModel;
