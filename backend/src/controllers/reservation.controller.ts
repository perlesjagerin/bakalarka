import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { reservationService } from '../services/reservation.service';

const createReservationSchema = z.object({
  eventId: z.string().uuid('Neplatné ID akce'),
  ticketCount: z.number().int().positive('Počet vstupenek musí být kladné číslo')
});

export const createReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const data = createReservationSchema.parse(req.body);

    const reservation = await reservationService.createReservation({
      eventId: data.eventId,
      userId: req.user.userId,
      ticketCount: data.ticketCount
    });

    res.status(201).json({
      message: 'Rezervace byla úspěšně vytvořena',
      reservation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getMyReservations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const reservations = await reservationService.getUserReservations(req.user.userId);

    res.json({ reservations, count: reservations.length });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const isAdmin = req.user.role === 'ADMIN';

    const reservation = await reservationService.getReservationById(
      id,
      isAdmin ? undefined : req.user.userId
    );

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const { ticketCount } = req.body;

    const updatedReservation = await reservationService.updateReservation({
      reservationId: id,
      userId: req.user.userId,
      ticketCount
    });

    res.json({
      message: 'Rezervace byla úspěšně aktualizována',
      reservation: updatedReservation
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const isAdmin = req.user.role === 'ADMIN';

    await reservationService.cancelReservation({
      reservationId: id,
      userId: req.user.userId,
      isAdmin
    });

    res.json({ message: 'Rezervace byla úspěšně zrušena' });
  } catch (error) {
    next(error);
  }
};
