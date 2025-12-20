import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
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
    location: string;
  };
}

export const usePayment = (reservationId: string | undefined) => {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (reservationId) {
      fetchReservationAndPaymentIntent();
    }
  }, [reservationId]);

  const fetchReservationAndPaymentIntent = async () => {
    try {
      // Načtení detailu rezervace
      const resResponse = await api.get(`/reservations/${reservationId}`);
      setReservation(resResponse.data.reservation);

      // Pokud je rezervace zdarma, nekontaktuj Stripe
      if (Number(resResponse.data.reservation.totalAmount) === 0) {
        setLoading(false);
        return;
      }

      // Pokud je už zaplaceno, přesměruj
      if (resResponse.data.reservation.status === 'PAID') {
        showSuccessToast(SUCCESS_MESSAGES.PAYMENT_ALREADY_COMPLETED);
        navigate('/reservations');
        return;
      }

      // Vytvoření payment intent
      const paymentResponse = await api.post('/payments/create-payment-intent', {
        reservationId,
      });
      
      setClientSecret(paymentResponse.data.clientSecret);
    } catch (error) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.LOAD_PAYMENT_ERROR;
      setError(errorMsg);
      showErrorToast(error, ERROR_MESSAGES.LOAD_PAYMENT_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return {
    reservation,
    clientSecret,
    loading,
    error,
    navigate,
  };
};
