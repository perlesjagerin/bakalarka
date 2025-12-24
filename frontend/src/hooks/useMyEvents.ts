import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRMATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  totalTickets: number;
  availableTickets: number;
  ticketPrice: number;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  confirmedRevenue?: number;
  confirmedTicketsSold?: number;
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    reservations: number;
  };
}

export const useMyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/events/my');
      console.log('Raw events from API:', response.data.events);
      
      // Detailní log každé akce
      response.data.events.forEach((event: any) => {
        console.log(`Event: ${event.title}`);
        console.log(`  - ticketPrice: ${event.ticketPrice} (${typeof event.ticketPrice})`);
        console.log(`  - confirmedRevenue: ${event.confirmedRevenue} (${typeof event.confirmedRevenue})`);
        console.log(`  - confirmedTicketsSold: ${event.confirmedTicketsSold}`);
      });
      
      setEvents(response.data.events);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_EVENTS_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm(CONFIRMATION_MESSAGES.DELETE_EVENT)) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      showSuccessToast(SUCCESS_MESSAGES.EVENT_DELETED);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.DELETE_EVENT_ERROR);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      if (!confirm(CONFIRMATION_MESSAGES.CANCEL_EVENT)) {
        return;
      }
    } else if (newStatus === 'PUBLISHED') {
      if (!confirm(CONFIRMATION_MESSAGES.PUBLISH_EVENT)) {
        return;
      }
    }

    try {
      await api.patch(`/events/${eventId}`, { status: newStatus });

      const statusMessages: Record<string, string> = {
        'PUBLISHED': SUCCESS_MESSAGES.EVENT_PUBLISHED,
        'CANCELLED': SUCCESS_MESSAGES.EVENT_CANCELLED,
        'COMPLETED': SUCCESS_MESSAGES.EVENT_COMPLETED,
        'DRAFT': SUCCESS_MESSAGES.EVENT_DRAFT,
      };

      showSuccessToast(statusMessages[newStatus] || SUCCESS_MESSAGES.EVENT_STATUS_CHANGED);
      fetchMyEvents();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_EVENT_STATUS_ERROR);
    }
  };

  return {
    events,
    loading,
    handleDeleteEvent,
    handleStatusChange,
  };
};
