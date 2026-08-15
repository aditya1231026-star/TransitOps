import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TransitOps Backend Running'
  });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Centralized error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    // Establish connection to database first
    await connectDB();

    // Start listening on configured port
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`✗ Failed to start the server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
