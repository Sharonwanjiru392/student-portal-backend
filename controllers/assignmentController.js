const db = require('../config/db');
const path = require('path');

// Upload Assignment (Admin)
exports.uploadAssignment = (req, res) => {
  const { title, description, due_date } = req.body;
  const file = req.file;

  if (!title || !due_date || !file) {
    return res.status(400).json({ msg: 'Please fill all fields and attach a file' });
  }

  const filePath = path.join('uploads/assignments', file.filename);

  db.query(
    'INSERT INTO assignments (title, description, due_date, file_path) VALUES (?, ?, ?, ?)',
    [title, description, due_date, filePath],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      res.status(201).json({ msg: 'Assignment uploaded successfully' });
    }
  );
};

// Get All Assignments (Students)
exports.getAllAssignments = (req, res) => {
  const query = 'SELECT id, title, description, due_date, file_path FROM assignments ORDER BY due_date ASC';

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    const assignments = results.map(a => ({
      ...a,
      file_url: `${req.protocol}://${req.get('host')}/${a.file_path.replace(/\\/g, '/')}`
    }));

    res.status(200).json(assignments);
  });
};
