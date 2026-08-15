import express from 'express';
import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection middleware to all driver routes
router.use(protect);

router.route('/')
  .post(createDriver)
  .get(getAllDrivers);

router.route('/:id')
  .get(getDriverById)
  .put(updateDriver)
  .delete(deleteDriver);

export default router;
