import { Router } from 'express';
import { CornController } from '../../../presentation/controllers/CornController.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimitCorn } from '../middleware/rateLimitCorn.js';

const ctrl = new CornController();
export const cornRoutes = Router();

cornRoutes.post('/purchase', requireAuth, rateLimitCorn(), ctrl.buy);
