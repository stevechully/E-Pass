import { Router } from 'express';
import { getAccommodations } from '../controllers/accommodations.controller.js';

const router = Router();

router.get('/', getAccommodations);

export default router;
