import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents
} from '../controllers/event.controller';

const router = Router();

// Public routes
router.get('/', getAllEvents);

// Protected routes (must be before /:id to avoid conflict)
router.get('/my', authenticate, authorize('ORGANIZER', 'ADMIN'), getMyEvents);

// Public route with param (must be after specific routes)
router.get('/:id', getEventById);

// Other protected routes
router.use(authenticate);

router.post('/', authorize('ORGANIZER', 'ADMIN'), createEvent);
router.patch('/:id', authorize('ORGANIZER', 'ADMIN'), updateEvent);
router.delete('/:id', authorize('ORGANIZER', 'ADMIN'), deleteEvent);

export default router;
