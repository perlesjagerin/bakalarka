import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReservationCard from '../components/ReservationCard';
import ReservationStats from '../components/reservations/ReservationStats.tsx';
import ReservationFilters from '../components/reservations/ReservationFilters.tsx';
import { useMyReservations } from '../hooks/useMyReservations';

type FilterType = 'all' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

const getStatusBadge = (status: string) => {
  const badges = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
  };
  const labels = {
    PENDING: 'Čeká na platbu',
    PAID: 'Zaplaceno',
    CANCELLED: 'Zrušeno',
    REFUNDED: 'Refundováno',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
};

export default function MyReservationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const {
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
  } = useMyReservations();

  const filteredReservations = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Moje rezervace</h1>
        <p className="text-gray-600">Přehled všech vašich rezervací a vstupenek</p>
      </div>

      <ReservationStats reservations={reservations} />

      <ReservationFilters filter={filter} setFilter={setFilter} />

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
