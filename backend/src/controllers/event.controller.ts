import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { eventService } from '../services/event.service';

const createEventSchema = z.object({
  title: z.string().min(1, 'Název je povinný'),
  description: z.string().min(1, 'Popis je povinný'),
  location: z.string().min(1, 'Místo konání je povinné'),
  startDate: z.string().datetime('Neplatné datum zahájení'),
  endDate: z.string().datetime('Neplatné datum ukončení'),
  category: z.string().min(1, 'Kategorie je povinná'),
  totalTickets: z.number().int().positive('Počet vstupenek musí být kladné číslo'),
  ticketPrice: z.number().nonnegative('Cena vstupenky nemůže být záporná'),
  imageUrl: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Neplatná URL obrázku'
  }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional()
});

export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const data = createEventSchema.parse(req.body);

    const event = await eventService.createEvent({
      title: data.title,
      description: data.description,
      location: data.location,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      category: data.category,
      totalTickets: data.totalTickets,
      ticketPrice: data.ticketPrice,
      imageUrl: data.imageUrl,
      status: data.status,
      organizerId: req.user.userId
    });

    res.status(201).json({
      message: 'Akce byla úspěšně vytvořena',
      event
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getAllEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, startDate, endDate, search } = req.query;

    const events = await eventService.getAllEvents({
      category: category as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      search: search as string | undefined
    });

    res.json({ events, count: events.length });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;
    const data = createEventSchema.partial().parse(req.body);

    // Připravit data pro update
    const updateData: any = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };

    // Pokud imageUrl není v requestu vůbec, neměnit ji
    // Pokud je v requestu prázdná, nastavit na null
    if ('imageUrl' in data) {
      updateData.imageUrl = data.imageUrl || null;
    }

    const updatedEvent = await eventService.updateEvent(
      id,
      req.user.userId,
      req.user.role,
      updateData
    );

    res.json({
      message: 'Akce byla úspěšně aktualizována',
      event: updatedEvent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const { id } = req.params;

    await eventService.deleteEvent(id, req.user.userId, req.user.role);

    res.json({ message: 'Akce byla úspěšně zrušena' });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Uživatel není autentizován', 401);
    }

    const events = await eventService.getMyEvents(req.user.userId, req.user.role);

    res.json({ events, count: events.length });
  } catch (error) {
    next(error);
  }
};
