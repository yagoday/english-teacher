const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config/.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in newer versions of mongoose
      // but included for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// If this file is run directly (node config/db.js), test the connection
if (require.main === module) {
  connectDB()
    .then(() => {
      console.log('Connection test successful');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Connection test failed:', error);
      process.exit(1);
    });
}

module.exports = connectDB; 