import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getDashboardStats } from '../controllers/admin.controller';

const router = Router();

// All routes require ADMIN authentication
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStats);

export default router;
