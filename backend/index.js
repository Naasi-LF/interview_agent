const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8080;
const DATABASE_URL = process.env.DATABASE_URL;

// Connect to MongoDB
mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});
