import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// This will be accessible at /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
    message: 'Backend is running'
  });
});

// This will be accessible at /api/health/protected
router.get('/health/protected', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;