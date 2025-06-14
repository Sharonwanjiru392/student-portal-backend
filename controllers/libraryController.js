const db = require('../config/db');
const path = require('path');

exports.uploadBook = (req, res) => {
  const { title } = req.body;
  const file = req.file;
  const uploaded_by = req.user.id;

  if (!file || !title) return res.status(400).json({ msg: 'Title and file are required' });

  db.query(
    'INSERT INTO library (title, file_path, uploaded_by) VALUES (?, ?, ?)',
    [title, file.path, uploaded_by],
    (err) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      res.status(201).json({ msg: 'Book uploaded successfully' });
    }
  );
};

exports.getBooks = (req, res) => {
  db.query('SELECT id, title, file_path, created_at FROM library ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    const books = results.map(book => ({
      ...book,
      file_url: `${req.protocol}://${req.get('host')}/${book.file_path.replace(/\\/g, '/')}`
    }));
    res.status(200).json(books);
  });
};

exports.downloadBook = (req, res) => {
  const bookId = req.params.id;

  db.query('SELECT file_path FROM library WHERE id = ?', [bookId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    if (results.length === 0) return res.status(404).json({ msg: 'Book not found' });

    const filePath = path.resolve(results[0].file_path);
    res.download(filePath);
  });
};
