import { Router } from 'express';
import { getEntrySlots } from '../controllers/entry-slots.controller.js';

const router = Router();

router.get('/', getEntrySlots);

export default router;
