const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected route: any logged-in user
router.get('/profile', verifyToken, (req, res) => {
  res.json({ msg: 'Welcome to your profile!', user: req.user });
});

// 🔐 Admin-only route
router.post('/admin-only', verifyToken, allowRoles('admin'), (req, res) => {
  res.json({ msg: 'This is an admin-only route. You have access!' });
});

module.exports = router;
