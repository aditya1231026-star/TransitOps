import express from 'express';
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMaintenanceLogs)
  .post(createMaintenanceLog);

router.route('/:id')
  .put(updateMaintenanceLog)
  .delete(deleteMaintenanceLog);

export default router;
