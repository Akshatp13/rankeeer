import express from 'express';
import { 
  getUserStats, 
  getLeaderboard, 
  getTestHistory, 
  getActivityLog 
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getUserStats);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/history', protect, getTestHistory);
router.get('/activity', protect, getActivityLog);

export default router;
