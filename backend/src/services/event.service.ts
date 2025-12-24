import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface CreateEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  category: string;
  totalTickets: number;
  ticketPrice: number;
  imageUrl?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  organizerId: string;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  totalTickets?: number;
  ticketPrice?: number;
  imageUrl?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

interface GetEventsFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

class EventService {
  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData) {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        category: data.category,
        totalTickets: data.totalTickets,
        availableTickets: data.totalTickets,
        ticketPrice: data.ticketPrice,
        imageUrl: data.imageUrl,
        status: data.status || 'DRAFT',
        organizerId: data.organizerId
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

    return event;
  }

  /**
   * Get all published events with optional filters
   */
  async getAllEvents(filters: GetEventsFilters) {
    const { category, startDate, endDate, search } = filters;

    const where: any = { status: 'PUBLISHED' };

    if (category) {
      where.category = category;
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
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

    return events;
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
    return {
      ...event,
      organizer: event.organizer ? {
        ...event.organizer,
        name: `${event.organizer.firstName} ${event.organizer.lastName}`
      } : null
    };
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, userId: string, userRole: string, data: UpdateEventData) {
    // Check if event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění upravovat tuto akci', 403);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data,
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

    return updatedEvent;
  }

  /**
   * Delete (cancel) event
   */
  async deleteEvent(eventId: string, userId: string, userRole: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError('Akce nebyla nalezena', 404);
    }

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Nemáte oprávnění smazat tuto akci', 403);
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { status: 'CANCELLED' }
    });
  }

  /**
   * Get events by organizer (or all for admin)
   */
  async getMyEvents(userId: string, userRole: string) {
    // Admin vidí všechny akce, organizátor jen své
    const where = userRole === 'ADMIN' 
      ? {} 
      : { organizerId: userId };

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
        reservations: {
          where: {
            status: { in: ['PAID', 'CONFIRMED'] }
          },
          select: {
            totalAmount: true,
            ticketCount: true
          }
        },
        _count: {
          select: { reservations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Přidání vypočítaného příjmu pro každou akci (pouze z PAID a CONFIRMED rezervací)
    const eventsWithRevenue = events.map(event => {
      const confirmedRevenue = event.reservations.reduce((sum, r) => sum + Number(r.totalAmount), 0);
      const confirmedTicketsSold = event.reservations.reduce((sum, r) => sum + r.ticketCount, 0);
      
      // Odstranění reservations z odpovědi
      const { reservations, ...eventWithoutReservations } = event;
      
      return {
        ...eventWithoutReservations,
        confirmedRevenue,
        confirmedTicketsSold
      };
    });

    return eventsWithRevenue;
  }
}

export const eventService = new EventService();
