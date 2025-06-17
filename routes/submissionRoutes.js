const express = require('express');
const router = express.Router();
const {
  submitAssignment,
  getAllSubmissions,
  getMySubmissions,
  gradeSubmission 
} = require('../controllers/submissionController');

const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

// 📤 Student submits assignment
router.post(
  '/submit',
  verifyToken,
  allowRoles('student'),
  upload.single('file'),
  submitAssignment
);

// 👨‍🏫 Admin views all student submissions
router.get(
  '/',
  verifyToken,
  allowRoles('admin'),
  getAllSubmissions
);

// 👩‍🎓 Student views their own submissions
router.get(
  '/my-submissions',
  verifyToken,
  allowRoles('student'),
  getMySubmissions
);
router.put(
  '/grade/:submission_id',
  verifyToken,
  allowRoles('admin'),
  gradeSubmission
);
module.exports = router;
