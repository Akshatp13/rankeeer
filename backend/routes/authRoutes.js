import express from 'express';
import { register, login, googleAuth, updateExamPreference } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.put('/exam-preference', protect, updateExamPreference);

export default router;
