const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../config/db');

// Get all notifications
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      res.status(200).json(results);
    }
  );
});

// Mark notification as read
router.put('/:id/read', verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  db.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      res.status(200).json({ msg: 'Notification marked as read' });
    }
  );
});

// Mark all as read
router.put('/mark-all-read', verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      res.status(200).json({ msg: 'All notifications marked as read' });
    }
  );
});

// Delete notification
router.delete('/:id', verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  db.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [notificationId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Notification not found or not authorized' });
      }
      res.status(200).json({ msg: 'Notification deleted successfully' });
    }
  );
});

module.exports = router;
