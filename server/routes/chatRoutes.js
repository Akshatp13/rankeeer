import express from 'express';
import { sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);

export default router;
