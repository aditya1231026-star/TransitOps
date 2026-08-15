import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with authMiddleware
router.use(protect);

router.get('/stats', getDashboardStats);

export default router;
