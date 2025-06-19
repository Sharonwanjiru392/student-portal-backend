const db = require('../config/db');

const markAttendance = (req, res) => {
  const { date, attendance } = req.body;

  if (!date || !attendance || !Array.isArray(attendance)) {
    return res.status(400).json({ msg: 'Invalid data provided' });
  }

  const values = attendance.map(({ studentId, status }) => [studentId, date, status]);

  db.query('INSERT INTO attendance (student_id, date, status) VALUES ?', [values], (err) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    // 🔔 Send notifications for absentees
    attendance.forEach(({ studentId, status }) => {
      if (status === 'absent') {
        const msg = `You were marked absent on ${date}.`;
        db.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [studentId, msg],
          (err2) => {
            if (err2) console.error('Notification error:', err2);
          }
        );
      }
    });

    return res.status(200).json({ msg: 'Attendance marked' });
  });
};
