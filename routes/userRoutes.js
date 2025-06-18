const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// ✅ Get all students (admin only)
router.get('/students', verifyToken, allowRoles('admin'), (req, res) => {
  db.query('SELECT id, name, email FROM users WHERE role = ?', ['student'], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    res.status(200).json(results);
  });
});

module.exports = router;
