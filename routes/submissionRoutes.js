const express = require('express');
const router = express.Router();
const { submitAssignment } = require('../controllers/submissionController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');
const { getAllSubmissions } = require('../controllers/submissionController');
const { getMySubmissions } = require('../controllers/submissionController');

// Students submit assignment
router.post(
  '/submit',
  verifyToken,
  allowRoles('student'),
  upload.single('file'),
  submitAssignment
);
router.get(
  '/',
  verifyToken,
  allowRoles('admin'),
  getAllSubmissions
);
router.get(
  '/my-submissions',
  verifyToken,
  allowRoles('student'),
  getMySubmissions
);
module.exports = router;
