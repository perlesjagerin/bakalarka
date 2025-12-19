import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import ReservationCard from '../components/ReservationCard';
import api from '../lib/axios';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRMATION_MESSAGES, formatMessage } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface Reservation {
  id: string;
  reservationCode: string;
  ticketCount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
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

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'>('all');
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

  const downloadTicket = (reservation: Reservation) => {
    // TODO: Implementovat generování PDF vstupenky s QR kódem
    const message = formatMessage(SUCCESS_MESSAGES.TICKET_DOWNLOAD_PLACEHOLDER, { code: reservation.reservationCode });
    showSuccessToast(message);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservationId(reservation.id);
    setNewTicketCount(reservation.ticketCount);
  };

  const handleUpdateReservation = async (reservationId: string) => {
    if (newTicketCount < 1) {
      showErrorToast(VALIDATION_MESSAGES.MIN_TICKET_COUNT);
      return;
    }
    
    try {
      await api.put(`/reservations/${reservationId}`, {
        ticketCount: newTicketCount
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

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      PENDING: 'Čeká na platbu',
      CONFIRMED: 'Potvrzeno',
      CANCELLED: 'Zrušeno',
      REFUNDED: 'Vráceno',
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Moje rezervace</h1>
        <p className="text-gray-600">Přehled všech vašich rezervací a vstupenek</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 mb-1">Celkem</p>
          <p className="text-3xl font-bold text-gray-900">{reservations.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Potvrzené</p>
          <p className="text-3xl font-bold text-green-600">
            {reservations.filter(r => r.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Čeká na platbu</p>
          <p className="text-3xl font-bold text-yellow-600">
            {reservations.filter(r => r.status === 'PENDING').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Celková útrata</p>
          <p className="text-3xl font-bold text-primary-600">
            {reservations
              .filter(r => r.status === 'CONFIRMED')
              .reduce((sum, r) => sum + Number(r.totalAmount), 0)
              .toLocaleString('cs-CZ')} Kč
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Vše' : 
             f === 'PENDING' ? 'Čeká na platbu' :
             f === 'CONFIRMED' ? 'Potvrzené' :
             f === 'CANCELLED' ? 'Zrušené' :
             'Vráceno'}
          </button>
        ))}
      </div>

      {/* Reservations list */}
      {filteredReservations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? 'Zatím nemáte žádné rezervace.' : 'Žádné rezervace v této kategorii.'}
          </p>
          {filter === 'all' && (
            <Link to="/events" className="btn-primary inline-block">
              Procházet akce
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4" data-testid="reservations-list">
          {filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={handleCancelReservation}
              getStatusBadge={getStatusBadge}
              downloadTicket={downloadTicket}
              editingReservationId={editingReservationId}
              newTicketCount={newTicketCount}
              setNewTicketCount={setNewTicketCount}
              handleUpdateReservation={handleUpdateReservation}
              handleCancelEdit={handleCancelEdit}
              handleStartEdit={handleEditReservation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
