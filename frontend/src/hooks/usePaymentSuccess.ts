import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ERROR_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface Reservation {
  id: string;
  reservationCode: string;
  ticketCount: number;
  totalAmount: number;
  status: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    imageUrl?: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    paidAt: string;
  };
}

export const usePaymentSuccess = (reservationId: string | null) => {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservationId) {
      showErrorToast(ERROR_MESSAGES.INVALID_RESERVATION);
      navigate('/reservations');
      return;
    }

    fetchReservation();
  }, [reservationId]);

  const fetchReservation = async () => {
    try {
      const response = await api.get(`/reservations/${reservationId}`);
      setReservation(response.data.reservation);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_RESERVATIONS_ERROR);
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async () => {
    if (!reservation) return;

    try {
      const response = await api.get(`/tickets/download/${reservation.id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vstupenka-${reservation.reservationCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessToast('Vstupenka byla stažena');
    } catch (error) {
      showErrorToast(error, 'Chyba při stahování vstupenky');
    }
  };

  return {
    reservation,
    loading,
    downloadTicket,
    navigate,
  };
};
