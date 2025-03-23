import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/english-teacher';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// If Node process ends, close the MongoDB connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
}); 