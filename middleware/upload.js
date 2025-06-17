// /middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the folder exists
const submissionsPath = path.join(__dirname, '..', 'uploads', 'submissions');
if (!fs.existsSync(submissionsPath)) {
  fs.mkdirSync(submissionsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, submissionsPath); // ✅ Save to 'uploads/submissions'
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

module.exports = upload;
