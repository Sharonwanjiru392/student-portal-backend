const db = require('../config/db');
const path = require('path');

// 👩‍🎓 Student submits an assignment
exports.submitAssignment = (req, res) => {
  const { assignment_id } = req.body;
  const student_id = req.user.id;
  const file = req.file;

  if (!assignment_id || !file) {
    return res.status(400).json({ msg: 'Assignment ID and file are required' });
  }

  const filePath = path.join('uploads/submissions', file.filename);

  db.query(
    'INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)',
    [assignment_id, student_id, filePath],
    (err, result) => {
      if (err) return res.status(500).json({ msg: 'Database error', err });

      res.status(201).json({ msg: 'Assignment submitted successfully' });
    }
  );
};

// 👨‍🏫 Admin views all student submissions
exports.getAllSubmissions = (req, res) => {
  const query = `
    SELECT 
      submissions.id,
      users.name AS student_name,
      assignments.title AS assignment_title,
      submissions.file_path,
      submissions.submitted_at
    FROM submissions
    JOIN users ON submissions.student_id = users.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    ORDER BY submissions.submitted_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    const formatted = results.map((sub) => ({
      ...sub,
      file_url: `http://localhost:5000/${sub.file_path.replace(/\\/g, '/')}`
    }));

    res.status(200).json(formatted);
  });
};

// 👩‍🎓 Student views their own submissions (with "Late" or "On Time" status)
exports.getMySubmissions = (req, res) => {
  const student_id = req.user.id;

  const query = `
    SELECT 
      submissions.id,
      assignments.title AS assignment_title,
      assignments.due_date,
      submissions.file_path,
      submissions.submitted_at
    FROM submissions
    JOIN assignments ON submissions.assignment_id = assignments.id
    WHERE submissions.student_id = ?
    ORDER BY submissions.submitted_at DESC
  `;

  db.query(query, [student_id], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });

    const formatted = results.map((sub) => {
      const submitted = new Date(sub.submitted_at);
      const due = new Date(sub.due_date);
      const status = submitted <= due ? 'On Time' : 'Late';

      return {
        id: sub.id,
        assignment_title: sub.assignment_title,
        submitted_at: sub.submitted_at,
        due_date: sub.due_date,
        status,
        file_url: `http://localhost:5000/${sub.file_path.replace(/\\/g, '/')}`
      };
    });

    res.status(200).json(formatted);
  });
};
// 👨‍🏫 Admin grades a submission
exports.gradeSubmission = (req, res) => {
  const { submission_id } = req.params;
  const { grade } = req.body;

  if (grade == null || grade === '') {
    return res.status(400).json({ msg: 'Grade is required' });
  }

  // You can add validation for grade range here (0-100) if you want
  const numericGrade = Number(grade);
  if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return res.status(400).json({ msg: 'Grade must be a number between 0 and 100' });
  }

  const query = `UPDATE submissions SET grade = ? WHERE id = ?`;

  db.query(query, [numericGrade, submission_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Database error', err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    res.status(200).json({ msg: 'Grade updated successfully' });
  });
};

// 👨‍🏫 Admin views a specific student's submission