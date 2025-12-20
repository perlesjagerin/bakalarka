import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { complaintService } from '../services/complaint.service';

const createComplaintSchema = z.object({
  reservationId: z.string().uuid('Neplatné ID rezervace'),
  reason: z.string().min(1, 'Důvod reklamace je povinný'),
  description: z.string().min(10, 'Popis musí mít alespoň 10 znaků')
});

export const createComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const data = createComplaintSchema.parse(req.body);

    const complaint = await complaintService.createComplaint({
      reservationId: data.reservationId,
      userId: req.user.userId,
      reason: data.reason,
      description: data.description
    });

    res.status(201).json({
      message: 'Reklamace byla úspěšně podána',
      complaint
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getMyComplaints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const complaints = await complaintService.getUserComplaints(req.user.userId);

    res.json({ complaints, count: complaints.length });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;

    const complaint = await complaintService.getComplaintById(id);

    // Verify user owns this complaint or is admin
    if (complaint.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění k této reklamaci', 403);
    }

    res.json({ complaint });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;

    const complaintsWithName = await complaintService.getAllComplaints(
      status as string | undefined
    );

    res.json({ complaints: complaintsWithName, count: complaintsWithName.length });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const complaint = await complaintService.updateComplaintStatus({
      complaintId: id,
      status,
      adminResponse
    });

    res.json({
      message: 'Status reklamace byl aktualizován',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { adminResponse, shouldRefund } = req.body;

    const updatedComplaint = await complaintService.resolveComplaint({
      complaintId: id,
      adminResponse,
      shouldRefund: shouldRefund || false
    });

    // Add name field to user
    const complaintWithName = {
      ...updatedComplaint,
      user: {
        ...updatedComplaint.reservation.user,
        id: updatedComplaint.userId,
        name: `${updatedComplaint.reservation.user.firstName} ${updatedComplaint.reservation.user.lastName}`
      }
    };

    res.json({ 
      message: 'Reklamace byla vyřešena',
      complaint: complaintWithName
    });
  } catch (error) {
    next(error);
  }
};
