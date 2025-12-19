import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  resolveComplaint
} from '../controllers/complaint.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST routes
router.post('/', createComplaint);
router.post('/:id/resolve', authorize('ADMIN'), resolveComplaint);

// GET routes - specific paths first, then parameterized
router.get('/my', getMyComplaints);
router.get('/all', authorize('ADMIN'), getAllComplaints);
router.get('/:id', getComplaintById);

// PUT routes
router.put('/:id/status', authorize('ADMIN'), updateComplaintStatus);

export default router;
