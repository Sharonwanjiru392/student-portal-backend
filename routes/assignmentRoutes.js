const express = require('express');
const router = express.Router();
const { uploadAssignment, getAllAssignments } = require('../controllers/assignmentController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

// Students view all assignments
router.get(
  '/',
  verifyToken,
  getAllAssignments
);

// Admin uploads assignment
router.post(
  '/upload',
  verifyToken,
  allowRoles('admin'),
  upload.single('file'),
  uploadAssignment
);

module.exports = router;
