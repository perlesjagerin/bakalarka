import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface Reservation {
  id: string;
  reservationCode: string;
  numberOfTickets: number;
  totalPrice: number;
  status: string;
  event: {
    id: string;
    title: string;
    startDate: string;
  };
}

interface Complaint {
  id: string;
  reason: string;
  description: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
  adminResponse?: string;
  refundIssued: boolean;
  createdAt: string;
  reservation: {
    reservationCode: string;
    event: {
      title: string;
    };
  };
}

interface ComplaintFormData {
  reservationId: string;
  reason: string;
  description: string;
}

export const useUserComplaints = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResponse, compResponse] = await Promise.all([
        api.get('/reservations/my'),
        api.get('/complaints/my'),
      ]);
      
      const paidReservations = resResponse.data.reservations.filter(
        (r: Reservation) => r.status === 'PAID'
      );
      setReservations(paidReservations);
      setComplaints(compResponse.data.complaints);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_DATA_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitComplaint = async (data: ComplaintFormData) => {
    try {
      await api.post('/complaints', data);
      showSuccessToast(SUCCESS_MESSAGES.COMPLAINT_SUBMITTED);
      await fetchData();
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.CREATE_COMPLAINT_ERROR);
      return false;
    }
  };

  return {
    reservations,
    complaints,
    loading,
    submitComplaint,
  };
};
