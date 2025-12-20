import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReset } from 'react-hook-form';
import api from '../lib/axios';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';
import { EventFormData } from '../types/eventForm';

export const useEditEvent = (eventId: string | undefined, reset: UseFormReset<EventFormData>) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      const event = response.data.event;
      
      const startDate = new Date(event.startDate).toISOString().slice(0, 16);
      const endDate = new Date(event.endDate).toISOString().slice(0, 16);
      
      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        startDate,
        endDate,
        category: event.category,
        totalTickets: event.totalTickets,
        ticketPrice: event.ticketPrice,
        imageUrl: event.imageUrl || '',
        status: event.status,
      });
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_EVENT_ERROR);
      navigate('/my-events');
    }
  };

  const updateEvent = async (data: EventFormData) => {
    try {
      const eventData: any = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      
      if (!eventData.imageUrl || eventData.imageUrl.trim() === '') {
        eventData.imageUrl = '';
      }
      
      await api.patch(`/events/${eventId}`, eventData);
      showSuccessToast(SUCCESS_MESSAGES.EVENT_UPDATED);
      navigate('/my-events');
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_EVENT_ERROR);
      return false;
    }
  };

  return { updateEvent };
};
