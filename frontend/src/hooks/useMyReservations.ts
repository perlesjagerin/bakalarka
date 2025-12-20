import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRMATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface Reservation {
  id: string;
  reservationCode: string;
  ticketCount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    ticketPrice: number;
    imageUrl?: string;
    status: string;
    availableTickets: number;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    paidAt: string;
  };
}

export const useMyReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
  const [newTicketCount, setNewTicketCount] = useState<number>(1);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my');
      setReservations(response.data.reservations);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_RESERVATIONS_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm(CONFIRMATION_MESSAGES.CANCEL_RESERVATION)) {
      return;
    }

    try {
      await api.delete(`/reservations/${reservationId}`);
      showSuccessToast(SUCCESS_MESSAGES.RESERVATION_CANCELLED);
      fetchReservations();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.CANCEL_RESERVATION_ERROR);
    }
  };

  const downloadTicket = async (reservation: Reservation) => {
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

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservationId(reservation.id);
    setNewTicketCount(reservation.ticketCount);
  };

  const handleUpdateReservation = async (reservationId: string) => {
    if (newTicketCount < 1) {
      showErrorToast('Minimální počet vstupenek je 1');
      return;
    }

    try {
      await api.put(`/reservations/${reservationId}`, {
        ticketCount: newTicketCount,
      });
      showSuccessToast(SUCCESS_MESSAGES.RESERVATION_UPDATED);
      setEditingReservationId(null);
      fetchReservations();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_RESERVATION_ERROR);
    }
  };

  const handleCancelEdit = () => {
    setEditingReservationId(null);
    setNewTicketCount(1);
  };

  return {
    reservations,
    loading,
    handleCancelReservation,
    downloadTicket,
    editingReservationId,
    newTicketCount,
    setNewTicketCount,
    handleEditReservation,
    handleUpdateReservation,
    handleCancelEdit,
  };
};
