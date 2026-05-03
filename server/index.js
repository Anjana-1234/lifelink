const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

//  Middleware 
app.use(express.json());   // Parse JSON request bodies
app.use(cors());           // Allow requests from frontend (localhost:3000)

//  Database Connection 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

//  Routes 
//  All auth routes will be prefixed with /api/auth
app.use('/api/auth', require('./routes/auth'));

//  Test Route 
app.get('/', (req, res) => {
  res.json({ message: '🩸 LifeLink API is running' });
});

//  Start Server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});