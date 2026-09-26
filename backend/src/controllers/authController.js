const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Customer role
    const roleRes = await query(`SELECT id FROM roles WHERE name = 'customer'`);
    const customerRoleId = roleRes.rows[0].id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await query(
      `INSERT INTO users (name, email, password_hash, role_id, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, customerRoleId, phone || null]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'customer'
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.phone, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const addresses = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    const ordersSummary = await query(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_spent
       FROM orders WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        user: req.user,
        addresses: addresses.rows,
        summary: ordersSummary.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateRes = await query(
      `UPDATE users
       SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, phone`,
      [name, phone, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated',
      data: updateRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const resAddresses = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: resAddresses.rows });
  } catch (err) {
    next(err);
  }
};

const saveAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, isDefault } = req.body;

    if (isDefault) {
      await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [req.user.id]);
    }

    const insertRes = await query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, fullName, phone, addressLine1, addressLine2, city, state, postalCode, isDefault || false]
    );

    res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAddresses,
  saveAddress,
};
