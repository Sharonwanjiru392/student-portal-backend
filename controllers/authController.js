// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ─────────────────────────── REGISTER ─────────────────────────── */
exports.register = (req, res) => {
  const { name, email, password } = req.body;
  const role = 'student';              // 🔒 Always register as student

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }

  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    if (results.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new student
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        (err2) => {
          if (err2) return res.status(500).json({ msg: 'Database error', err: err2 });

          res.status(201).json({ msg: 'User registered successfully' });
        }
      );
    } catch (error) {
      res.status(500).json({ msg: 'Password hashing failed', error });
    }
  });
};

/* ───────────────────────────── LOGIN ───────────────────────────── */
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    if (results.length === 0) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallbackSecret',
        { expiresIn: '1d' }
      );

      res.status(200).json({
        msg: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ msg: 'Login failed', error });
    }
  });
};
