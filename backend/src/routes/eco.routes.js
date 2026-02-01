import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createEcoDeclaration,
  getMyEcoDeclaration,
  cancelEcoDeclaration
} from '../controllers/eco.controller.js';

const router = Router();

router.post('/declare', requireAuth, createEcoDeclaration);
router.get('/my/:epassId', requireAuth, getMyEcoDeclaration);
router.post('/cancel/:id', requireAuth, cancelEcoDeclaration);

export default router;
