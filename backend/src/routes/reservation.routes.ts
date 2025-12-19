import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  cancelReservation
} from '../controllers/reservation.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createReservation);
router.get('/my', getMyReservations);
router.get('/:id', getReservationById);
router.put('/:id', updateReservation);
router.delete('/:id', cancelReservation);

export default router;
