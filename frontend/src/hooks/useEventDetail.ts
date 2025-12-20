import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';
import { useAuthStore } from '../store/authStore';

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
  status: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
}

export const useEventDetail = (eventId: string | undefined) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  const fetchEventDetail = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data.event);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_EVENT_ERROR);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (ticketCount: number) => {
    if (!isAuthenticated) {
      showErrorToast(ERROR_MESSAGES.LOGIN_REQUIRED);
      navigate('/login');
      return;
    }

    if (ticketCount < 1 || ticketCount > (event?.availableTickets || 0)) {
      showErrorToast(VALIDATION_MESSAGES.INVALID_TICKET_COUNT);
      return;
    }

    setReserving(true);
    try {
      const response = await api.post('/reservations', {
        eventId,
        ticketCount,
      });
      
      showSuccessToast(SUCCESS_MESSAGES.RESERVATION_CREATED);
      
      if (Number(event?.ticketPrice) === 0 || response.data.reservation.totalAmount === 0) {
        navigate('/reservations');
      } else {
        navigate(`/reservations/${response.data.reservation.id}/payment`);
      }
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.CREATE_RESERVATION_ERROR);
    } finally {
      setReserving(false);
    }
  };

  return {
    event,
    loading,
    reserving,
    createReservation,
    isAuthenticated,
  };
};
