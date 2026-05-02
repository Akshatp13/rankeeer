import express from 'express';
import { 
  chatWithMentor, 
  generateStudyPlan, 
  analyzeExam, 
  generateTest, 
  generateMockExam, 
  generateTestFromNotes,
  detectWeakness,
  generateRevisionSheet,
  reviseFromNotes
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithMentor);
router.post('/study-plan', protect, generateStudyPlan);
router.post('/analyze-exam', protect, analyzeExam);
router.post('/generate-test', protect, generateTest);
router.post('/generate-mock', protect, generateMockExam);
router.post('/generate-test-from-notes', protect, generateTestFromNotes);
router.post('/detect-weakness', protect, detectWeakness);
router.post('/generate-revision-sheet', protect, generateRevisionSheet);
router.post('/revise-from-notes', protect, reviseFromNotes);

export default router;
