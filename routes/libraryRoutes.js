const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const { uploadBook, getBooks, downloadBook } = require('../controllers/libraryController');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/library'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload book (Admin only)
router.post('/upload', verifyToken, allowRoles('admin'), upload.single('file'), uploadBook);

// Get all books (Student/Admin)
router.get('/', verifyToken, getBooks);

// Download book
router.get('/download/:id', verifyToken, downloadBook);

module.exports = router;
