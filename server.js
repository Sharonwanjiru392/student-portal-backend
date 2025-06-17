const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db'); // add this line at the top
const app = express();
const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const path = require('path'); // ✅ at the top

dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/grades', gradeRoutes);
// app.use('/api', notificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/library', libraryRoutes);

app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Student Portal API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
