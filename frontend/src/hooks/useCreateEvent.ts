import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';
import { EventFormData } from '../types/eventForm';

export const useCreateEvent = () => {
  const navigate = useNavigate();

  const createEvent = async (data: EventFormData) => {
    try {
      const eventData: any = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      
      // Remove imageUrl if empty
      if (!eventData.imageUrl || eventData.imageUrl.trim() === '') {
        delete eventData.imageUrl;
      }
      
      const response = await api.post('/events', eventData);
      showSuccessToast(SUCCESS_MESSAGES.EVENT_CREATED);
      navigate(`/events/${response.data.event.id}`);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.CREATE_EVENT_ERROR);
    }
  };

  return { createEvent };
};
