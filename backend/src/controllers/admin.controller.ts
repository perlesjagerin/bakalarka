import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { adminService } from '../services/admin.service';

export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};
