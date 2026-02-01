import { Router } from 'express';
import { getFoodSlots } from '../controllers/food-slots.controller.js';

const router = Router();

router.get('/', getFoodSlots);

export default router;
