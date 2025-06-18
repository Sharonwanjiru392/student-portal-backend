// routes/attendanceRoutes.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const verify  = require('../middleware/authMiddleware');
const allow   = require('../middleware/roleMiddleware');

/** POST /api/attendance/mark
 * Body:
 * {
 *   "date": "2025-06-18",
 *   "attendance": [
 *     { "student_id": 1, "status": "present" },
 *     { "student_id": 2, "status": "absent" }
 *   ]
 * }
 */
router.post('/mark', verify, allow('admin'), (req, res) => {
  const { date, attendance } = req.body;

  if (!date || !Array.isArray(attendance) || !attendance.length)
    return res.status(400).json({ msg: 'Missing required fields' });

  // Build VALUES array -> [ [student_id, date, status], ... ]
  const values = attendance.map(({ student_id, status }) => [
    student_id,
    date,
    status,
  ]);

  db.query(
    'INSERT INTO attendance (student_id, date, status) VALUES ?',
    [values],
    err => {
      if (err) return res.status(500).json({ msg: 'DB error', err });
      res.status(201).json({ msg: 'Attendance marked successfully' });
    }
  );
});

/** GET /api/attendance/absentees/:date  (admin only) */
router.get('/absentees/:date', verify, allow('admin'), (req, res) => {
  const { date } = req.params;

  db.query(
    `SELECT u.id, u.name
       FROM users u
      WHERE u.role = 'student'
        AND u.id NOT IN (
          SELECT student_id FROM attendance WHERE date = ?
        )`,
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: 'DB error', err });
      res.json(rows);
    }
  );
});

/** GET /api/attendance/my  (student views own attendance) */
router.get('/my', verify, (req, res) => {
  const studentId = req.user.id;

  db.query(
    'SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC',
    [studentId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: 'DB error', err });
      res.json(rows);
    }
  );
});

module.exports = router;
