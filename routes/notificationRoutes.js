const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// 1. Send a notification (admin only)
router.post('/send', verifyToken, allowRoles('admin'), (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ msg: 'User ID and message are required' });
  }

  db.query(
    'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
    [user_id, message],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });
      res.status(201).json({ msg: 'Notification sent successfully' });
    }
  );
});

// 2. Get all notifications for the logged-in user (student/admin)
// Get notifications for logged-in user
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let query = '';
  let params = [];

  if (userRole === 'admin') {
    // Admins see all
    query = 'SELECT * FROM notifications ORDER BY created_at DESC';
  } else {
    // Students see personal + global (null user_id)
    query = 'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC';
    params = [userId];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Notification fetch error:', err);
      return res.status(500).json({ msg: 'Database error', err });
    }
    res.status(200).json(results);
  });
});


// 3. Mark a specific notification as read
router.put('/read/:id', verifyToken, (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  db.query(
    'UPDATE notifications SET `read` = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
    [notificationId, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating notification:', err);
        return res.status(500).json({ msg: 'Database error', err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Notification not found or not authorized' });
      }

      res.status(200).json({ msg: 'Notification marked as read' });
    }
  );
});

router.delete('/:id', verifyToken, (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  let query = '';
  let params = [];

  if (userRole === 'admin') {
    // Admin can delete any notification
    query = 'DELETE FROM notifications WHERE id = ?';
    params = [notificationId];
  } else {
    // Students can only delete their own notifications
    query = 'DELETE FROM notifications WHERE id = ? AND user_id = ?';
    params = [notificationId, userId];
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Notification not found or not authorized' });
    }
    res.status(200).json({ msg: 'Notification deleted successfully' });
  });
});

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


module.exports = router;
