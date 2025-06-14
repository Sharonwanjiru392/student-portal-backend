const db = require('../config/db');

exports.giveGrade = (req, res) => {
  const { submission_id, grade, feedback } = req.body;

  if (!submission_id || !grade) {
    return res.status(400).json({ msg: 'Submission ID and grade are required' });
  }

  // First insert the grade
  db.query(
    'INSERT INTO grades (submission_id, grade, feedback) VALUES (?, ?, ?)',
    [submission_id, grade, feedback || null],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });

      // Now fetch student ID and assignment title for notification
      const studentQuery = `
        SELECT 
          submissions.student_id, 
          assignments.title AS assignment_title 
        FROM submissions 
        JOIN assignments ON submissions.assignment_id = assignments.id 
        WHERE submissions.id = ?
      `;

      db.query(studentQuery, [submission_id], (err2, data) => {
        if (err2) return res.status(500).json({ msg: 'Notification query error', err: err2 });

        if (!data || !data.length) {
          return res.status(404).json({ msg: 'Submission not found for notification' });
        }

        const { student_id, assignment_title } = data[0];

        // Insert notification
        db.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [student_id, `You received grade ${grade} for "${assignment_title}"`],
          (err3) => {
            if (err3) return res.status(500).json({ msg: 'Notification insert error', err: err3 });

            res.status(201).json({ msg: 'Grade submitted successfully and notification sent' });
          }
        );
      });
    }
  );
};

exports.getGrades = (req, res) => {
  const query = `
    SELECT 
      grades.id,
      users.name AS student_name,
      assignments.title AS assignment_title,
      grades.grade,
      grades.feedback,
      grades.created_at
    FROM grades
    JOIN submissions ON grades.submission_id = submissions.id
    JOIN users ON submissions.student_id = users.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    ORDER BY grades.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    res.status(200).json(results);
  });
};

exports.getMyGrades = (req, res) => {
  const studentId = req.user.id;

  const query = `
    SELECT 
      grades.id,
      assignments.title AS assignment_title,
      grades.grade,
      grades.feedback,
      grades.created_at
    FROM grades
    JOIN submissions ON grades.submission_id = submissions.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    WHERE submissions.student_id = ?
    ORDER BY grades.created_at DESC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    res.status(200).json(results);
  });
};