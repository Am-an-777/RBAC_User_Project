const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const CRUD_Routes = require('./routes/CRUD_Routes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Error handling middleware
app.use(errorHandler);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/file',fileRoutes);
app.use('/api/user',CRUD_Routes);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.dbUri)
  .then(() => {
    console.log('Database connected successfully');
    app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
  })
  .catch((error) => console.log(`Error connecting to database: ${error.message}`));