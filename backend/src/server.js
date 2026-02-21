require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./modules/admin/admin.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

const app = express();

// Global Middleware
app.use(cors()); 
app.use(express.json()); 

// Import Routes
const authRoutes = require('./modules/auth/auth.routes');
const timetableRoutes = require('./modules/timetables/timetable.routes');
const swapRoutes = require('./modules/swaps/swap.routes');
const issueRoutes = require('./modules/issues/issue.routes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Lectro API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});