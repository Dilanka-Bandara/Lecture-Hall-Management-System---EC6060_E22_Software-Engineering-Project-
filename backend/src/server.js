require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Global Middleware
app.use(cors()); 
app.use(express.json()); 

// Import Routes
const authRoutes = require('./modules/auth/auth.routes');

// Mount Routes
app.use('/api/auth', authRoutes);

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Lectro API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});