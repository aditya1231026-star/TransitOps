import mongoose from 'mongoose';
import { seedDefaultAdmin } from '../utils/seeder.js';

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin user if none exists
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
