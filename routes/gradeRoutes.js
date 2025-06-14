const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const {
  giveGrade,
  getGrades,       // ✅ This matches the export in your controller
  getMyGrades
} = require('../controllers/gradeController');

// Admin routes
router.post('/give', verifyToken, allowRoles('admin'), giveGrade);
router.get('/all', verifyToken, allowRoles('admin'), getGrades);

// Student route
router.get('/mine', verifyToken, allowRoles('student'), getMyGrades);

module.exports = router;
