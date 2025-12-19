import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateProfile,
  updatePassword,
  deleteUser
} from '../controllers/user.controller';

const router = Router();

// Protect all routes
router.use(authenticate);

// Profile routes (must be before /:id)
router.patch('/profile', updateProfile);
router.patch('/password', updatePassword);

// Admin routes
router.get('/', authorize('ADMIN'), getAllUsers);

// Other routes
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
