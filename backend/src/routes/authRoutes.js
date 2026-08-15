import express from 'express';
import { loginUser, registerUser, getUserProfile, getAllUsers, updateUserRole } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, getAllUsers);
router.put('/users/:id/role', protect, updateUserRole);

export default router;
