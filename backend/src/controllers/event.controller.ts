import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

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

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        category: data.category,
        totalTickets: data.totalTickets,
        availableTickets: data.totalTickets,
        ticketPrice: data.ticketPrice,
        imageUrl: data.imageUrl,
        status: data.status || 'DRAFT',
        organizerId: req.user.userId
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
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

    const where: any = { status: 'PUBLISHED' };

    if (category) {
      where.category = category as string;
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate as string) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate as string) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
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

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    // Add name field to organizer
    const eventWithOrganizerName = {
      ...event,
      organizer: event.organizer ? {
        ...event.organizer,
        name: `${event.organizer.firstName} ${event.organizer.lastName}`
      } : null
    };

    res.json({ event: eventWithOrganizerName });
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

    // Check if event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    if (event.organizerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění upravovat tuto akci', 403);
    }

    // Připravit data pro update - pokud imageUrl není poslaná nebo je prázdná, nastavit na null
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

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

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

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    if (event.organizerId !== req.user.userId && req.user.role !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění smazat tuto akci', 403);
    }

    await prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

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

    // Admin vidí všechny akce, organizátor jen své
    const where = req.user.role === 'ADMIN' 
      ? {} 
      : { organizerId: req.user.userId };

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { reservations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ events, count: events.length });
  } catch (error) {
    next(error);
  }
};
